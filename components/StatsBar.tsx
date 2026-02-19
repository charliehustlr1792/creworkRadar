export function StatsBar({ total, highIntent }: { total: number; highIntent: number }) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {[
        { label: 'TOTAL COMPANIES', value: total, color: 'text-white' },
        { label: 'HIGH INTENT (70+)', value: highIntent, color: 'text-emerald-400' },
        { label: 'SOURCES ACTIVE', value: 3, color: 'text-blue-400' }
      ].map(s => (
        <div key={s.label} className="bg-zinc-900/50 border border-zinc-800/60 rounded-lg px-5 py-4">
          <div className="text-[9px] text-zinc-600 tracking-widest mb-2">{s.label}</div>
          <div className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</div>
        </div>
      ))}
    </div>
  )
}