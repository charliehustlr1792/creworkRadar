'use client'
import { useState, useMemo } from 'react'
import { IntentBadge } from './IntentBadge'

export function CompanyTable({ initialCompanies }: { initialCompanies: any[] }) {
  const [search, setSearch]     = useState('')
  const [industry, setIndustry] = useState('all')
  const [minScore, setMinScore] = useState(0)
  const [sortBy, setSortBy]     = useState('intentScore')
  const [selected, setSelected] = useState<any | null>(null)

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
        if (sortBy === 'name') return a.name.localeCompare(b.name)
        return 0
      }),
    [initialCompanies, search, industry, minScore, sortBy]
  )

  return (
    <div>
      {/* Filter bar */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <input
          placeholder="Search companies..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none w-52"
        />
        <select value={industry} onChange={e => setIndustry(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-300">
          {industries.map(i => <option key={i} value={i}>{i === 'all' ? 'All Industries' : i}</option>)}
        </select>
        <select value={minScore} onChange={e => setMinScore(Number(e.target.value))}
          className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-300">
          <option value={0}>All scores</option>
          <option value={70}>High (70+)</option>
          <option value={40}>Medium (40+)</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-xs text-zinc-300">
          <option value="intentScore">Intent Score</option>
          <option value="signalCount">Signal Count</option>
          <option value="name">Name</option>
        </select>
        <span className="text-xs text-zinc-600 self-center ml-auto">{filtered.length} companies</span>
      </div>

      {/* Table */}
      <div className="border border-zinc-800/60 rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="text-left px-4 py-3 text-zinc-500 tracking-widest font-normal">COMPANY</th>
              <th className="text-left px-4 py-3 text-zinc-500 tracking-widest font-normal">INDUSTRY</th>
              <th className="text-left px-4 py-3 text-zinc-500 tracking-widest font-normal">STAGE</th>
              <th className="text-left px-4 py-3 text-zinc-500 tracking-widest font-normal">SIGNALS</th>
              <th className="text-left px-4 py-3 text-zinc-500 tracking-widest font-normal">INTENT SCORE</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-zinc-600">No companies found</td></tr>
            )}
            {filtered.map(company => (
              <tr key={company.id} onClick={() => setSelected(company)}
                className="border-b border-zinc-800/40 hover:bg-zinc-900/60 cursor-pointer transition-colors">
                <td className="px-4 py-3">
                  <div className="text-white font-semibold">{company.name}</div>
                  {company.website && <div className="text-zinc-600 text-[10px]">{company.website}</div>}
                </td>
                <td className="px-4 py-3 text-zinc-400">{company.industry || '—'}</td>
                <td className="px-4 py-3 text-zinc-500">{company.stage || '—'}</td>
                <td className="px-4 py-3">
                  <span className="text-emerald-500 font-bold">{company.signalCount}</span>
                  <span className="text-zinc-600"> signals</span>
                </td>
                <td className="px-4 py-3"><IntentBadge score={company.intentScore} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="w-105 h-full bg-zinc-950 border-l border-zinc-800 p-6 overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold font-mono text-sm">{selected.name}</h2>
              <button onClick={() => setSelected(null)} className="text-zinc-600 hover:text-white text-lg">✕</button>
            </div>

            <IntentBadge score={selected.intentScore} large />

            <div className="mt-5">
              <div className="text-[10px] text-zinc-500 tracking-widest mb-2">WHY FLAGGED</div>
              <p className="text-zinc-300 text-sm leading-relaxed border border-zinc-800 rounded p-3 bg-zinc-900/50">
                {selected.whyFlagged || 'No AI summary available'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5">
              {[
                ['Industry', selected.industry],
                ['Stage', selected.stage],
                ['Team Size', selected.sizeEstimate],
                ['Signals', `${selected.signalCount} detected`]
              ].map(([label, val]) => (
                <div key={label} className="bg-zinc-900 border border-zinc-800 rounded p-3">
                  <div className="text-[9px] text-zinc-600 tracking-widest mb-1">{label}</div>
                  <div className="text-zinc-200 text-xs">{val || '—'}</div>
                </div>
              ))}
            </div>

            {selected.website && (
              <a href={selected.website} target="_blank"
                className="block text-center text-xs py-2 mt-4 border border-emerald-500/30 text-emerald-400 rounded hover:bg-emerald-500/10 transition-colors">
                Visit Website →
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}