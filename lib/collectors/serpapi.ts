export async function fetchJobSignals() {
  if (!process.env.SERPAPI_KEY) {
    console.log('[SerpAPI] No key found, skipping job signals')
    return []
  }

  const queries = [
    '"sales development representative" site:linkedin.com/jobs',
    '"head of sales" OR "VP sales" startup site:linkedin.com/jobs',
    '"outbound sales" "series A" site:linkedin.com/jobs'
  ]
  const results = []

  for (const q of queries) {
    const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(q)}&api_key=${process.env.SERPAPI_KEY}&num=8`
    const res = await fetch(url)
    if (!res.ok) continue

    const data = await res.json()
    for (const item of data.organic_results || []) {
      results.push({
        source: 'serpapi' as const,
        signal_type: 'hiring' as const,
        raw_text: `${item.title} ${item.snippet || ''}`.slice(0, 600),
        url: item.link
      })
    }
  }
  return results
}