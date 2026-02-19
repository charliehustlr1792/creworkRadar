import { callLLM } from './llm'

interface ExtractedCompany {
  company_name: string | null
  website: string | null
  industry: string | null
  stage: string
  is_relevant: boolean
  confidence: number
}

export async function extractCompanyFromSignal(signal: {
  source: string
  signal_type: string
  raw_text: string
  url: string
}): Promise<ExtractedCompany | null> {

  const prompt = `You are a B2B sales intelligence extractor. Given this text from ${signal.source}, identify if a specific company is mentioned that might need sales/outbound support.

TEXT: "${signal.raw_text}"
URL: "${signal.url}"
SIGNAL TYPE: ${signal.signal_type}

Respond with this exact JSON structure:
{
  "company_name": "Company Inc or null if no specific company identified",
  "website": "https://company.com or null",
  "industry": "SaaS | FinTech | HealthTech | EdTech | eCommerce | MarketingTech | HRTech | Other | null",
  "stage": "seed | series-a | series-b | growth | unknown",
  "is_relevant": true or false,
  "confidence": 0.0 to 1.0
}

Rules:
- is_relevant is true ONLY if: a specific company name is identifiable AND they show signals of needing outbound/sales help (hiring salespeople, just got funded, discussing customer acquisition, growing team)
- Set confidence below 0.5 if the company name is unclear or generic
- Generic posts ("any companies hiring SDRs?") should be is_relevant: false`

  try {
    const json = await callLLM(prompt)
    console.log('[DEBUG] Raw LLM response:', json)
    const parsed = JSON.parse(json)
    console.log('[DEBUG] Parsed:', parsed)
    if (!parsed.company_name || !parsed.is_relevant || parsed.confidence < 0.5) return null
    return parsed
  } catch (err) {
    console.error('[DEBUG] Extract error:', err)
    return null
  }
}