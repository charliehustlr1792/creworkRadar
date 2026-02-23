export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-24 text-center px-4">
      <div className="relative mb-6">
        <div className="w-14 h-14 sm:w-16 sm:h-16 border border-gray-200 rounded-xl flex items-center justify-center bg-white shadow-sm">
          <div className="w-7 h-7 sm:w-8 sm:h-8 border border-gray-200 rounded-lg flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-gray-200 rounded-sm" />
          </div>
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-100 border border-emerald-200 rounded-sm" />
        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-amber-100 border border-amber-200 rounded-sm" />
      </div>
      <div className="text-gray-400 text-xs font-mono tracking-widest mb-2">NO RESULTS FOUND</div>
      <div className="text-gray-400 text-xs max-w-xs leading-relaxed font-mono">
        No companies match your current filters. Try adjusting the score threshold or clearing the search.
      </div>
    </div>
  )
}