import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

async function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

export async function callLLM(prompt: string, retries = 3): Promise<string> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: 'You are a JSON-only assistant. Respond with valid JSON only, no markdown, no explanation, no code blocks.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 400  // reduced from 600 to save tokens
      })

      const text = completion.choices[0]?.message?.content || '{}'
      return text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

    } catch (err: any) {
      const is429 = err?.status === 429
      const isLastAttempt = attempt === retries - 1

      if (is429 && !isLastAttempt) {
        // Parse retry delay from error message, default to 5s
        const match = err?.message?.match(/Please try again in (\d+(\.\d+)?)s/)
        const delay = match ? parseFloat(match[1]) * 1000 + 500 : 5000
        console.warn(`[LLM] Rate limited, retrying in ${delay}ms...`)
        await sleep(delay)
        continue
      }

      throw err
    }
  }
  throw new Error('LLM failed after all retries')
}