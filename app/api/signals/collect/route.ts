import { fetchHNSignals } from '@/lib/collectors/hackernews'
import { fetchRedditSignals } from '@/lib/collectors/reddit'
import { fetchJobSignals } from '@/lib/collectors/serpapi'

export async function POST(req: Request) {
  // Protect endpoint so only cron job or you can trigger it
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch all sources in parallel (fail gracefully if one source is down)
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

  // Hand off to AI pipeline (async, don't block the response)
  fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ai/process`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.CRON_SECRET}`
    },
    body: JSON.stringify({ signals: allSignals })
  }).catch(err => console.error('[AI Process] Failed:', err))

  return Response.json({
    ok: true,
    collected: allSignals.length,
    sources: {
      hackernews: hn.status === 'fulfilled' ? hn.value.length : 'failed',
      reddit: reddit.status === 'fulfilled' ? reddit.value.length : 'failed',
      serpapi: jobs.status === 'fulfilled' ? jobs.value.length : 'skipped'
    }
  })
}