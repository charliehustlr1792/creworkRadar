import { fetchHNSignals } from '@/lib/collectors/hackernews'
import { fetchRedditSignals } from '@/lib/collectors/reddit'
import { fetchJobSignals } from '@/lib/collectors/serpapi'

export async function POST(req: Request) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [hn, reddit, jobs] = await Promise.allSettled([
    fetchHNSignals(),
    fetchRedditSignals(),
    fetchJobSignals()
  ])

  const allSignals = [
    ...(hn.status === 'fulfilled' ? hn.value : []),
    ...(reddit.status === 'fulfilled' ? reddit.value : []),
    ...(jobs.status === 'fulfilled' ? jobs.value : [])
  ]

  console.log(`[Collect] Total signals: ${allSignals.length}`)

  // Wait for AI process to complete so we can return stats
  let processed = 0, new_companies = 0, updated_companies = 0
  try {
    const aiRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ai/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CRON_SECRET}`
      },
      body: JSON.stringify({ signals: allSignals })
    })
    const aiData = await aiRes.json()
    processed         = aiData.processed         ?? 0
    new_companies     = aiData.new_companies     ?? 0
    updated_companies = aiData.updated_companies ?? 0
  } catch (err) {
    console.error('[AI Process] Failed:', err)
  }

  return Response.json({
    ok: true,
    collected: allSignals.length,
    processed,
    new_companies,
    updated_companies,
    sources: {
      hackernews: hn.status === 'fulfilled' ? hn.value.length : 'failed',
      reddit:     reddit.status === 'fulfilled' ? reddit.value.length : 'failed',
      serpapi:    jobs.status === 'fulfilled' ? jobs.value.length : 'skipped'
    }
  })
}