import { callLLM } from './llm'

// ── PART 1: Rule-based base score (fast, deterministic, free) ──────────────
// This runs first before any LLM call, so we have a baseline even if AI fails

export function calculateBaseScore(signals: { signal_type: string; source: string }[]): {
  score: number
  breakdown: { funding: number; hiring: number; growth: number; discussion: number }
} {
  // Signal type weights: funding signals are the strongest buying intent indicator
  const typeWeights = {
    funding:    40,  // Just raised = has budget = most likely to buy
    hiring:     30,  // Hiring sales = actively building go-to-market
    growth:     20,  // Growing signals = needs scale support
    discussion: 10   // Weak signal — could just be research
  }

  // Source credibility bonus: more authoritative sources boost confidence
  const sourceBonus = {
    crunchbase: 12, // Verified funding data
    serpapi:    8,  // Verified job posting
    hackernews: 4,  // Self-reported but credible community
    reddit:     2   // Lowest credibility, easiest to fake
  }

  const breakdown = { funding: 0, hiring: 0, growth: 0, discussion: 0 }
  let total = 0

  for (const sig of signals) {
    const typeW = typeWeights[sig.signal_type as keyof typeof typeWeights] || 5
    const srcB  = sourceBonus[sig.source as keyof typeof sourceBonus] || 0
    const points = typeW + srcB

    const key = sig.signal_type as keyof typeof breakdown
    if (key in breakdown) {
      breakdown[key] = Math.min(breakdown[key] + points, typeW * 2) // Cap each category
    }
    total += points
  }

  // Multi-signal bonus: appearing in 2+ sources means stronger intent signal
  if (signals.length >= 2) total += 15
  if (signals.length >= 3) total += 10

  return { score: Math.min(total, 100), breakdown }
}

// ── PART 2: LLM qualitative reasoning (adds context the rules can't catch) ──
export async function enrichWithAIReasoning(
  companyName: string,
  signals: { signal_type: string; raw_text: string }[],
  baseScore: number
): Promise<{ adjusted_score: number; why_flagged: string; size_estimate: string }> {

  const signalContext = signals
    .slice(0, 3)
    .map(s => `[${s.signal_type.toUpperCase()}] ${s.raw_text?.slice(0, 120)}`)
    .join('\n')

  const prompt = `You are a B2B sales intelligence analyst. Evaluate if "${companyName}" is likely to need external sales/outbound/appointment-setting services.

Rule-based score so far: ${baseScore}/100
Evidence:
${signalContext}

A company is a strong prospect when: they just raised funding (budget exists), hiring salespeople (building GTM), discussing growth challenges (pain point), or expanding into new markets.

Respond with this JSON:
{
  "adjusted_score": integer 0-100 (adjust base score up/down based on context quality),
  "why_flagged": "One crisp sentence a salesperson would immediately understand. E.g.: Just raised $4M Series A and is actively hiring their first SDR team, indicating they have budget and are building outbound from scratch.",
  "size_estimate": "1-10 | 11-50 | 51-200 | 200+"
}`

  try {
    const json = await callLLM(prompt)
    return JSON.parse(json)
  } catch {
    // Graceful degradation: if AI fails, use rule-based score with generic message
    return {
      adjusted_score: baseScore,
      why_flagged: `Multiple ${signals.map(s => s.signal_type).join(' + ')} signals detected`,
      size_estimate: 'unknown'
    }
  }
}