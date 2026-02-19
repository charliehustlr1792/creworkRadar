import { prisma } from '@/lib/prisma'
import { extractCompanyFromSignal } from '@/lib/ai/extract'
import { calculateBaseScore, enrichWithAIReasoning } from '@/lib/ai/score'

export async function POST(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { signals } = await req.json()
  console.log('[DEBUG] Signals received:', signals.length)

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

  console.log('[DEBUG] Total extracted:', extracted.length)

  const companyMap = new Map<string, { info: any; signals: any[] }>()

  for (const { signal, extracted: info } of extracted) {
    const key = info.company_name.toLowerCase().trim()
    if (!companyMap.has(key)) {
      companyMap.set(key, { info, signals: [signal] })
    } else {
      companyMap.get(key)!.signals.push(signal)
    }
  }

  console.log('[DEBUG] Unique companies:', companyMap.size)

  let newCompanies = 0
  let updatedCompanies = 0

  for (const [, { info, signals: companySigs }] of companyMap) {
    const { score: baseScore, breakdown } = calculateBaseScore(companySigs)
    const aiResult = await enrichWithAIReasoning(info.company_name, companySigs, baseScore)

    console.log('[DEBUG] Company:', info.company_name, '| score:', aiResult.adjusted_score)

    await new Promise(r => setTimeout(r, 500))

    const breakdownStr = JSON.stringify(breakdown)

    const existing = await prisma.company.findUnique({
      where: { name: info.company_name },
      select: { id: true, signalCount: true, intentScore: true }
    })

    if (existing) {
      // Update company
      await prisma.company.update({
        where: { id: existing.id },
        data: {
          intentScore:    Math.min(existing.intentScore + 8, 100),
          signalCount:    existing.signalCount + companySigs.length,
          whyFlagged:     aiResult.why_flagged,
          scoreBreakdown: breakdownStr,
          description:    aiResult.why_flagged, // use why_flagged as description
        }
      })

      // Write signals to DB
      await prisma.signal.createMany({
        data: companySigs.map((sig: any) => ({
          companyId:  existing.id,
          source:     sig.source,
          signalType: sig.signal_type,
          rawText:    sig.raw_text?.slice(0, 500),
          url:        sig.url,
        }))
      })

      updatedCompanies++
    } else {
      // Create company
      const created = await prisma.company.create({
        data: {
          name:           info.company_name,
          website:        info.website,
          industry:       info.industry,
          stage:          info.stage,
          sizeEstimate:   aiResult.size_estimate,
          intentScore:    aiResult.adjusted_score,
          scoreBreakdown: breakdownStr,
          signalCount:    companySigs.length,
          whyFlagged:     aiResult.why_flagged,
          description:    aiResult.why_flagged,
        }
      })

      // Write signals to DB
      await prisma.signal.createMany({
        data: companySigs.map((sig: any) => ({
          companyId:  created.id,
          source:     sig.source,
          signalType: sig.signal_type,
          rawText:    sig.raw_text?.slice(0, 500),
          url:        sig.url,
        }))
      })

      newCompanies++
    }
  }

  console.log('[DEBUG] Done — new:', newCompanies, 'updated:', updatedCompanies)

  return Response.json({
    processed: companyMap.size,
    new_companies: newCompanies,
    updated_companies: updatedCompanies
  })
}