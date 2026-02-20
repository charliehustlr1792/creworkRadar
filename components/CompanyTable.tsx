'use client'
import { useState, useMemo } from 'react'
import { IntentBadge } from './IntentBadge'
import { EmptyState } from './EmptyState'

const SOURCE_META: Record<string, { short: string; color: string }> = {
  hackernews: { short: 'HN', color: 'bg-orange-500/10 border-orange-500/25 text-orange-400' },
  reddit:     { short: 'RD', color: 'bg-red-500/10    border-red-500/25    text-red-400'    },
  serpapi:    { short: 'SE', color: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' },
}

function isNew(createdAt: string) {
  return Date.now() - new Date(createdAt).getTime() < 24 * 60 * 60 * 1000
}

export function CompanyTable({ initialCompanies }: { initialCompanies: any[] }) {
  const [search, setSearch]       = useState('')
  const [industry, setIndustry]   = useState('all')
  const [minScore, setMinScore]   = useState(0)
  const [sortBy, setSortBy]       = useState('intentScore')
  const [selected, setSelected]   = useState<any | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)

  const industries = useMemo(() =>
    ['all', ...new Set(initialCompanies.map(c => c.industry).filter(Boolean))],
    [initialCompanies]
  )

  const filtered = useMemo(() =>
    initialCompanies
      .filter(c => {
        const matchSearch   = !search || c.name.toLowerCase().includes(search.toLowerCase())
        const matchIndustry = industry === 'all' || c.industry === industry
        const matchScore    = c.intentScore >= minScore
        return matchSearch && matchIndustry && matchScore
      })
      .sort((a, b) => {
        if (sortBy === 'intentScore') return b.intentScore - a.intentScore
        if (sortBy === 'signalCount') return b.signalCount - a.signalCount
        if (sortBy === 'newest')      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        if (sortBy === 'name')        return a.name.localeCompare(b.name)
        return 0
      }),
    [initialCompanies, search, industry, minScore, sortBy]
  )

  const newCount = initialCompanies.filter(c => isNew(c.createdAt)).length

  const getCompanySources = (company: any): string[] => {
    if (!company.signals?.length) return []
    return [...new Set(company.signals.map((s: any) => s.source))] as string[]
  }

  const selectClass = "bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-400 font-mono focus:outline-none focus:border-emerald-700/60 w-full"

  return (
    <div>
      {/* ── FILTER BAR ── */}
      <div className="mb-4 sm:mb-5">
        {/* Mobile: search + toggle */}
        <div className="flex gap-2 sm:hidden mb-2">
          <div className="relative flex-1">
            <input
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-7 pr-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:border-emerald-700/60 focus:outline-none font-mono"
            />
            <span className="absolute left-2.5 top-2.5 text-zinc-600 text-xs">⌕</span>
          </div>
          <button
            onClick={() => setFilterOpen(f => !f)}
            className="px-3 py-2 border border-zinc-800 rounded-lg text-zinc-500 text-xs font-mono hover:border-emerald-700/50 hover:text-emerald-500 transition-all"
          >
            {filterOpen ? '✕' : '⚙'}
          </button>
          <div className="flex items-center gap-2">
            {newCount > 0 && (
              <span className="text-[10px] font-mono px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md whitespace-nowrap">
                {newCount} NEW
              </span>
            )}
          </div>
        </div>

        {/* Mobile: expandable filters */}
        {filterOpen && (
          <div className="sm:hidden grid grid-cols-2 gap-2 mb-2">
            <select value={industry} onChange={e => setIndustry(e.target.value)} className={selectClass}>
              {industries.map(i => <option key={i} value={i}>{i === 'all' ? 'All Industries' : i}</option>)}
            </select>
            <select value={minScore} onChange={e => setMinScore(Number(e.target.value))} className={selectClass}>
              <option value={0}>All Intent</option>
              <option value={70}>High (70+)</option>
              <option value={40}>Medium (40+)</option>
            </select>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={`${selectClass} col-span-2`}>
              <option value="intentScore">↓ Intent Score</option>
              <option value="signalCount">↓ Signal Count</option>
              <option value="newest">↓ Newest First</option>
              <option value="name">↑ Name A–Z</option>
            </select>
          </div>
        )}

        {/* Desktop: full filter bar */}
        <div className="hidden sm:flex gap-2 items-center flex-wrap">
          <div className="relative">
            <input
              placeholder="Search companies..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:border-emerald-700/60 focus:outline-none w-52 font-mono"
            />
            <span className="absolute left-2.5 top-2.5 text-zinc-600 text-xs">⌕</span>
          </div>
          <select value={industry} onChange={e => setIndustry(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-400 font-mono focus:outline-none focus:border-emerald-700/60">
            {industries.map(i => <option key={i} value={i}>{i === 'all' ? 'All Industries' : i}</option>)}
          </select>
          <select value={minScore} onChange={e => setMinScore(Number(e.target.value))} className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-400 font-mono focus:outline-none focus:border-emerald-700/60">
            <option value={0}>All Intent</option>
            <option value={70}>High (70+)</option>
            <option value={40}>Medium (40+)</option>
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-400 font-mono focus:outline-none focus:border-emerald-700/60">
            <option value="intentScore">↓ Intent Score</option>
            <option value="signalCount">↓ Signal Count</option>
            <option value="newest">↓ Newest First</option>
            <option value="name">↑ Name A–Z</option>
          </select>
          <div className="ml-auto flex items-center gap-3">
            {newCount > 0 && (
              <span className="text-[10px] font-mono px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-md">
                {newCount} NEW
              </span>
            )}
            <span className="text-xs text-zinc-600 font-mono">{filtered.length} companies</span>
          </div>
        </div>

        {/* Mobile: result count */}
        <div className="sm:hidden text-[10px] text-zinc-600 font-mono">{filtered.length} companies</div>
      </div>

      {/* ── TABLE (desktop) / CARDS (mobile) ── */}
      <div className="border border-zinc-800/60 rounded-xl overflow-hidden">
        {filtered.length === 0 ? <EmptyState /> : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-xs min-w-175">
                <thead>
                  <tr className="border-b border-zinc-800/80 bg-zinc-900/30">
                    {['COMPANY', 'INDUSTRY', 'STAGE', 'SOURCES', 'SIGNALS', 'INTENT SCORE'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-zinc-600 tracking-widest font-mono font-normal text-[9px] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(company => {
                    const fresh = isNew(company.createdAt)
                    const sources = getCompanySources(company)
                    return (
                      <tr
                        key={company.id}
                        onClick={() => setSelected(company)}
                        className="border-b border-zinc-800/30 hover:bg-emerald-500/3 cursor-pointer transition-colors group"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-semibold group-hover:text-emerald-50 transition-colors">{company.name}</span>
                            {fresh && (
                              <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-sm tracking-widest">NEW</span>
                            )}
                          </div>
                          {company.website && (
                            <div className="text-zinc-600 text-[10px] font-mono mt-0.5 truncate max-w-50">{company.website}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-zinc-500 font-mono text-[11px]">{company.industry || '—'}</td>
                        <td className="px-4 py-3">
                          {company.stage
                            ? <span className="text-[10px] font-mono px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-400">{company.stage}</span>
                            : <span className="text-zinc-700">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {sources.length > 0
                              ? sources.map(src => (
                                <span key={src} className={`text-[9px] font-mono font-bold px-1.5 py-0.5 border rounded-sm ${SOURCE_META[src]?.color || 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}>
                                  {SOURCE_META[src]?.short || src.slice(0, 2).toUpperCase()}
                                </span>
                              ))
                              : <span className="text-zinc-700 text-[10px]">—</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-emerald-500 font-bold font-mono">{company.signalCount}</span>
                        </td>
                        <td className="px-4 py-3">
                          <IntentBadge score={company.intentScore} breakdown={company.scoreBreakdown} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-zinc-800/40">
              {filtered.map(company => {
                const fresh = isNew(company.createdAt)
                const sources = getCompanySources(company)
                return (
                  <div
                    key={company.id}
                    onClick={() => setSelected(company)}
                    className="px-4 py-4 hover:bg-emerald-500/3 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-white font-semibold text-sm truncate">{company.name}</span>
                          {fresh && (
                            <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-sm">NEW</span>
                          )}
                        </div>
                        {company.website && (
                          <div className="text-zinc-600 text-[10px] font-mono mt-0.5 truncate">{company.website}</div>
                        )}
                      </div>
                      <IntentBadge score={company.intentScore} breakdown={company.scoreBreakdown} />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {company.industry && (
                        <span className="text-[10px] text-zinc-500 font-mono">{company.industry}</span>
                      )}
                      {company.stage && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-500">{company.stage}</span>
                      )}
                      {sources.map(src => (
                        <span key={src} className={`text-[9px] font-mono font-bold px-1.5 py-0.5 border rounded-sm ${SOURCE_META[src]?.color || 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}>
                          {SOURCE_META[src]?.short || src.slice(0, 2).toUpperCase()}
                        </span>
                      ))}
                      <span className="text-[10px] text-emerald-600 font-mono ml-auto">{company.signalCount} signals</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* ── DETAIL PANEL ── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div
            className="w-full sm:w-115 h-full bg-zinc-950 border-l border-zinc-800/80 flex flex-col shadow-2xl shadow-black/60"
            onClick={e => e.stopPropagation()}
          >
            {/* Panel header */}
            <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-zinc-800/80 flex items-start justify-between shrink-0">
              <div className="flex-1 min-w-0 mr-3">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h2 className="text-white font-bold font-mono text-sm truncate">{selected.name}</h2>
                  {isNew(selected.createdAt) && (
                    <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-sm shrink-0">NEW</span>
                  )}
                </div>
                {selected.website && (
                  <a
                    href={selected.website} target="_blank" rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="text-[11px] text-zinc-600 font-mono hover:text-emerald-500 transition-colors truncate block"
                  >
                    {selected.website} ↗
                  </a>
                )}
              </div>
              <button onClick={() => setSelected(null)} className="text-zinc-600 hover:text-white transition-colors text-lg shrink-0">✕</button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 sm:py-5 space-y-5">

              {/* Score */}
              <div>
                <div className="text-[9px] font-mono text-zinc-600 tracking-widest mb-2">INTENT SCORE</div>
                <IntentBadge score={selected.intentScore} large breakdown={selected.scoreBreakdown} />
              </div>

              {/* AI Analysis */}
              <div>
                <div className="text-[9px] font-mono text-zinc-600 tracking-widest mb-2">AI ANALYSIS</div>
                <p className="text-zinc-300 text-sm leading-relaxed border border-zinc-800 rounded-lg p-3 bg-zinc-900/40">
                  {selected.whyFlagged || 'No AI summary available'}
                </p>
              </div>

              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['Industry',  selected.industry],
                  ['Stage',     selected.stage],
                  ['Team Size', selected.sizeEstimate],
                  ['Signals',   `${selected.signalCount} detected`],
                ].map(([label, val]) => (
                  <div key={label} className="bg-zinc-900/50 border border-zinc-800/80 rounded-lg p-3">
                    <div className="text-[9px] text-zinc-600 font-mono tracking-widest mb-1">{label}</div>
                    <div className="text-zinc-300 text-xs font-mono">{val || '—'}</div>
                  </div>
                ))}
              </div>

              {/* Sources */}
              {selected.signals?.length > 0 && (
                <div>
                  <div className="text-[9px] font-mono text-zinc-600 tracking-widest mb-2">DETECTED ON</div>
                  <div className="flex gap-2 flex-wrap">
                    {[...new Set(selected.signals.map((s: any) => s.source))].map((src: any) => (
                      <span key={src} className={`text-[10px] font-mono px-2.5 py-1 border rounded-md capitalize ${SOURCE_META[src]?.color || 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}>
                        {src}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Raw signals */}
              {selected.signals?.length > 0 && (
                <div>
                  <div className="text-[9px] font-mono text-zinc-600 tracking-widest mb-2">RAW SIGNALS</div>
                  <div className="space-y-2">
                    {selected.signals.slice(0, 5).map((sig: any, i: number) => (
                      <div key={i} className="border border-zinc-800/80 rounded-lg p-3 bg-zinc-900/20">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 border rounded-sm shrink-0 ${SOURCE_META[sig.source]?.color || 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}>
                            {SOURCE_META[sig.source]?.short || sig.source}
                          </span>
                          <span className="text-[9px] font-mono text-zinc-600 capitalize">{sig.signalType}</span>
                          {sig.url && (
                            <a
                              href={sig.url} target="_blank" rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="text-[9px] font-mono text-zinc-600 hover:text-emerald-500 ml-auto transition-colors"
                            >
                              view ↗
                            </a>
                          )}
                        </div>
                        <p className="text-zinc-500 text-[11px] leading-relaxed line-clamp-3">
                          {sig.rawText || 'No text available'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  )
}