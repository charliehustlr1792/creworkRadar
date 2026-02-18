// Abstraction layer: call Gemini first, fall back to Groq automatically

import { GoogleGenerativeAI } from '@google/generative-ai'
import Groq from 'groq-sdk'

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// Single function to call either LLM and always get clean JSON back
export async function callLLM(prompt: string): Promise<string> {
  // Try Gemini first (better quality, 1M tokens/day free)
  try {
    const model = gemini.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json', // Force JSON output — no markdown wrapping
        temperature: 0.1,                    // Low temperature = more deterministic JSON
        maxOutputTokens: 600
      }
    })
    const result = await model.generateContent(prompt)
    return result.response.text()
  } catch (geminiError: any) {
    // If Gemini fails (rate limit = 429, quota exceeded), fall back to Groq
    const isRateLimit = geminiError?.status === 429 || geminiError?.message?.includes('quota')
    if (!isRateLimit) throw geminiError // Re-throw non-rate-limit errors

    console.warn('[LLM] Gemini rate limited, falling back to Groq')

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'You are a JSON-only assistant. Respond with valid JSON only, no markdown, no explanation.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 600
    })

    const text = completion.choices[0]?.message?.content || '{}'
    // Groq sometimes wraps in ```json, strip it
    return text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  }
}