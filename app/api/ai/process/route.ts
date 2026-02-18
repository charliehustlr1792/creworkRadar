import { prisma } from '@/lib/prisma'
import { extractCompanyFromSignal } from '@/lib/ai/extract'
import { calculateBaseScore, enrichWithAIReasoning } from '@/lib/ai/score'

export async function POST(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { signals } = await req.json()

  // ── STEP 1: Extract companies from raw signal text ──────────────────────
  // Process in batches of 4 to respect 15 RPM Gemini limit
  const BATCH_SIZE = 4
  const extracted: Array<{ signal: (typeof signals)[0]; extracted: any }> = []

  for (let i = 0; i < signals.length; i += BATCH_SIZE) {
    const batch = signals.slice(i, i + BATCH_SIZE)

    const results = await Promise.allSettled(
      batch.map(async (sig: any) => {
        const data = await extractCompanyFromSignal(sig)
        return data ? { signal: sig, extracted: data } : null
      })
    )

    for (const r of results) {
      if (r.status === 'fulfilled' && r.value) extracted.push(r.value)
    }

    if (i + BATCH_SIZE < signals.length) await new Promise(r => setTimeout(r, 1000))
  }

  // ── STEP 2: Group by company name (deduplicate across sources) ──────────
  const companyMap = new Map()

  for (const { signal, extracted: info } of extracted) {
    const key = info.company_name.toLowerCase().trim()
    if (!companyMap.has(key)) {
      companyMap.set(key, { info, signals: [signal] })
    } else {
      companyMap.get(key)!.signals.push(signal)
    }
  }

  // ── STEP 3: Score + Enrich + Upsert each company ───────────────────────
  let newCompanies = 0
  let updatedCompanies = 0

  for (const [, { info, signals: companySigs }] of companyMap) {
    const { score: baseScore, breakdown } = calculateBaseScore(companySigs)
    const aiResult = await enrichWithAIReasoning(info.company_name, companySigs, baseScore)
    await new Promise(r => setTimeout(r, 500))

    // ── Prisma upsert: insert if new, update score if existing ─────────────
    // upsert() handles the "does it exist?" check in one atomic DB call
    const existing = await prisma.company.findUnique({
      where: { name: info.company_name },
      select: { id: true, signalCount: true, intentScore: true }
    })

    if (existing) {
      await prisma.company.update({
        where: { id: existing.id },
        data: {
          intentScore:    Math.min(existing.intentScore + 8, 100), // Multi-source boost
          signalCount:    existing.signalCount + companySigs.length,
          whyFlagged:     aiResult.why_flagged,
          scoreBreakdown: breakdown,
          // Prisma automatically sets updatedAt because of @updatedAt in schema
        }
      })
      updatedCompanies++
    } else {
      await prisma.company.create({
        data: {
          name:           info.company_name,
          website:        info.website,
          industry:       info.industry,
          stage:          info.stage,
          sizeEstimate:   aiResult.size_estimate,
          intentScore:    aiResult.adjusted_score,
          scoreBreakdown: breakdown,
          signalCount:    companySigs.length,
          whyFlagged:     aiResult.why_flagged,
        }
      })
      newCompanies++
    }
  }

  return Response.json({
    processed: companyMap.size,
    new_companies: newCompanies,
    updated_companies: updatedCompanies
  })
}