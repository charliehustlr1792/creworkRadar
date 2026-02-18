// Uses HN Algolia API — completely free, no key needed
export async function fetchHNSignals() {
  // Search for posts from the last 7 days (604800 seconds)
  const cutoff = Math.floor(Date.now() / 1000) - 604800
  const queries = ['hiring SDR', 'series A raised', 'we raised funding', 'sales outbound', 'appointment setting']
  const results = []

  for (const q of queries) {
    const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(q)}&tags=story&numericFilters=created_at_i>${cutoff}&hitsPerPage=10`
    const res = await fetch(url, { next: { revalidate: 3600 } }) // Cache 1hr
    const data = await res.json()

    for (const hit of data.hits || []) {
      results.push({
        source: 'hackernews' as const,
        signal_type: (q.includes('hiring') || q.includes('SDR') ? 'hiring' : 'funding') as 'hiring' | 'funding',
        raw_text: `${hit.title} ${hit.story_text || ''}`.slice(0, 600),
        url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`
      })
    }
  }
  return results
}



