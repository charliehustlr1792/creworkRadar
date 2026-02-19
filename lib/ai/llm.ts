import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function callLLM(prompt: string): Promise<string> {
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
    max_tokens: 600
  })

  const text = completion.choices[0]?.message?.content || '{}'
  return text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
}