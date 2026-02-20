interface StatsBarProps {
  total: number
  highIntent: number
  lastRefreshed: string | null
}

export function StatsBar({ total, highIntent, lastRefreshed }: StatsBarProps) {
  const conversionRate = total > 0 ? Math.round((highIntent / total) * 100) : 0

  const stats = [
    {
      label: 'TOTAL LEADS',
      value: total,
      sub: 'companies tracked',
      color: 'text-white',
      sub_color: 'text-zinc-600',
      glow: false,
    },
    {
      label: 'HIGH INTENT',
      value: highIntent,
      sub: 'score ≥ 70',
      color: 'text-emerald-400',
      sub_color: 'text-emerald-800',
      glow: true,
    },
    {
      label: 'CONVERSION',
      value: `${conversionRate}%`,
      sub: 'high intent ratio',
      color: 'text-emerald-300',
      sub_color: 'text-emerald-900',
      glow: false,
    },
    {
      label: 'LAST REFRESH',
      value: lastRefreshed
        ? new Date(lastRefreshed).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '—',
      sub: lastRefreshed
        ? new Date(lastRefreshed).toLocaleDateString([], { month: 'short', day: 'numeric' })
        : 'never refreshed',
      color: 'text-zinc-300',
      sub_color: 'text-zinc-600',
      glow: false,
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-px mb-5 sm:mb-6 rounded-xl overflow-hidden border border-zinc-800/60">
      {stats.map((s, i) => (
        <div
          key={i}
          className={`relative bg-zinc-950 px-4 sm:px-5 py-4 sm:py-5 ${s.glow ? 'before:absolute before:inset-0 before:bg-emerald-500/3' : ''}`}
        >
          <div className="text-[9px] text-zinc-600 tracking-widest font-mono mb-1.5 sm:mb-2">{s.label}</div>
          <div className={`text-xl sm:text-2xl font-bold font-mono tabular-nums ${s.color}`}>{s.value}</div>
          <div className={`text-[10px] mt-0.5 font-mono ${s.sub_color}`}>{s.sub}</div>
          {s.glow && (
            <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_2px_rgba(52,211,153,0.5)]" />
          )}
        </div>
      ))}
    </div>
  )
}