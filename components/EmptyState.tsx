export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center px-4">
      <div className="relative mb-6">
        <div className="w-14 h-14 sm:w-16 sm:h-16 border border-zinc-800 rounded-xl flex items-center justify-center">
          <div className="w-7 h-7 sm:w-8 sm:h-8 border border-zinc-700 rounded-lg flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-zinc-800 rounded-sm" />
          </div>
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500/10 border border-emerald-500/30 rounded-sm" />
        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-emerald-800/20 border border-emerald-700/30 rounded-sm" />
      </div>
      <div className="text-zinc-500 text-xs font-mono tracking-widest mb-2">NO RESULTS FOUND</div>
      <div className="text-zinc-700 text-xs max-w-xs leading-relaxed font-mono">
        No companies match your current filters. Try adjusting the score threshold or clearing the search.
      </div>
    </div>
  )
}