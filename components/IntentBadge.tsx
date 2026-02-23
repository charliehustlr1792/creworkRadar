'use client'

interface IntentBadgeProps {
  score: number
  large?: boolean
  breakdown?: Record<string, number> | null
}

export function IntentBadge({ score, large = false, breakdown }: IntentBadgeProps) {
  const cfg =
    score >= 70 ? { label: 'HIGH', bar: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200'  } :
    score >= 40 ? { label: 'MED',  bar: 'bg-amber-400',   text: 'text-amber-700',   bg: 'bg-amber-50  border-amber-200'    } :
                  { label: 'LOW',  bar: 'bg-gray-300',    text: 'text-gray-500',    bg: 'bg-gray-50   border-gray-200'     }

  return (
    <div className="group relative flex items-center gap-2">
      <span className={`text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-sm border font-mono ${cfg.bg} ${cfg.text}`}>
        {cfg.label}
      </span>
      <div className={`${large ? 'w-28 sm:w-32' : 'w-16 sm:w-20'} h-1.5 bg-gray-200 rounded-full overflow-hidden`}>
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
          <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg min-w-42.5">
            <div className="text-[9px] text-gray-400 tracking-widest mb-2.5 font-mono">SCORE BREAKDOWN</div>
            {Object.entries(breakdown).map(([key, val]) => (
              <div key={key} className="flex items-center justify-between gap-4 mb-2 last:mb-0">
                <span className="text-[10px] text-gray-500 capitalize font-mono">{key}</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${Math.min((Number(val) / 40) * 100, 100)}%` }} />
                  </div>
                  <span className="text-[10px] text-emerald-600 font-mono font-bold w-4 text-right">{val}</span>
                </div>
              </div>
            ))}
            <div className="mt-2.5 pt-2 border-t border-gray-100 flex justify-between">
              <span className="text-[9px] text-gray-400 font-mono">TOTAL</span>
              <span className="text-[10px] text-emerald-600 font-bold font-mono">{score}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}