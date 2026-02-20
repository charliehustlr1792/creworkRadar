'use client'

interface IntentBadgeProps {
  score: number
  large?: boolean
  breakdown?: Record<string, number> | null
}

export function IntentBadge({ score, large = false, breakdown }: IntentBadgeProps) {
  const cfg =
    score >= 70 ? { label: 'HIGH',   bar: 'bg-emerald-400',  text: 'text-emerald-400',  bg: 'bg-emerald-500/10  border-emerald-500/25'  } :
    score >= 40 ? { label: 'MED',    bar: 'bg-emerald-600',  text: 'text-emerald-600',  bg: 'bg-emerald-900/30  border-emerald-700/40'  } :
                  { label: 'LOW',    bar: 'bg-zinc-600',     text: 'text-zinc-500',     bg: 'bg-zinc-900        border-zinc-700'         }

  return (
    <div className="group relative flex items-center gap-2">
      <span className={`text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-sm border font-mono ${cfg.bg} ${cfg.text}`}>
        {cfg.label}
      </span>
      <div className={`${large ? 'w-28 sm:w-32' : 'w-16 sm:w-20'} h-1 bg-zinc-800 rounded-full overflow-hidden`}>
        <div
          className={`h-full ${cfg.bar} rounded-full transition-all duration-700`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={`${large ? 'text-sm' : 'text-xs'} ${cfg.text} font-bold font-mono tabular-nums`}>
        {score}
      </span>

      {/* Breakdown tooltip */}
      {breakdown && Object.keys(breakdown).length > 0 && (
        <div className="absolute bottom-full left-0 mb-2 z-50 hidden group-hover:block pointer-events-none">
          <div className="bg-zinc-950 border border-emerald-900/60 rounded-lg p-3 shadow-xl shadow-black/50 min-w-42.5">
            <div className="text-[9px] text-emerald-700 tracking-widest mb-2.5 font-mono">SCORE BREAKDOWN</div>
            {Object.entries(breakdown).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between gap-4 mb-2 last:mb-0">
                <span className="text-[10px] text-zinc-400 capitalize font-mono">{key}</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-14 h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500/60 rounded-full" style={{ width: `${Math.min((Number(val) / 40) * 100, 100)}%` }} />
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold w-4 text-right">{val}</span>
                </div>
              </div>
            ))}
            <div className="mt-2.5 pt-2 border-t border-zinc-800 flex justify-between">
              <span className="text-[9px] text-zinc-500 font-mono">TOTAL</span>
              <span className="text-[10px] text-emerald-400 font-bold font-mono">{score}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}