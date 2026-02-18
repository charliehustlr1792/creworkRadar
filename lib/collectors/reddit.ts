export async function fetchRedditSignals() {
  const searches = [
    { sub: 'entrepreneur', query: 'hiring sales SDR outbound' },
    { sub: 'startups', query: 'funding raised growing' },
    { sub: 'sales', query: 'outbound SDR appointment setting' }
  ]
  const results = []

  for (const { sub, query } of searches) {
    const url = `https://www.reddit.com/r/${sub}/search.json?q=${encodeURIComponent(query)}&sort=new&t=week&limit=15&restrict_sr=1`
    const res = await fetch(url, { headers: { 'User-Agent': 'LeadScout/1.0 research bot' } })
    if (!res.ok) continue

    const data = await res.json()
    for (const post of data?.data?.children || []) {
      const d = post.data
      if (d.score < 2) continue // Filter low-quality posts

      results.push({
        source: 'reddit' as const,
        signal_type: 'hiring' as const,
        raw_text: `${d.title} ${(d.selftext || '').slice(0, 300)}`.slice(0, 600),
        url: `https://reddit.com${d.permalink}`
      })
    }
  }
  return results
}