export function IntentBadge({ score, large = false }: { score: number; large?: boolean }) {
  const cfg =
    score >= 70 ? { label: 'HIGH',   bar: 'bg-emerald-400', text: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' } :
    score >= 40 ? { label: 'MEDIUM', bar: 'bg-yellow-400',  text: 'text-yellow-400',  bg: 'bg-yellow-500/10  border-yellow-500/20'  } :
                  { label: 'LOW',    bar: 'bg-zinc-600',    text: 'text-zinc-500',    bg: 'bg-zinc-900       border-zinc-800'        }

  return (
    <div className={`flex items-center gap-2 ${large ? 'py-2' : ''}`}>
      <span className={`text-[9px] font-bold tracking-widest px-2 py-0.5 rounded border ${cfg.bg} ${cfg.text}`}>
        {cfg.label}
      </span>
      <div className={`${large ? 'w-28' : 'w-16'} h-1.5 bg-zinc-800 rounded-full overflow-hidden`}>
        <div className={`h-full ${cfg.bar} rounded-full`} style={{ width: `${score}%` }} />
      </div>
      <span className={`${large ? 'text-sm' : 'text-[10px]'} ${cfg.text} font-bold`}>{score}</span>
    </div>
  )
}