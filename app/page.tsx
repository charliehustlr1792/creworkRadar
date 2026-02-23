import { prisma } from '@/lib/prisma'
import { CompanyTable } from '@/components/CompanyTable'
import { StatsBar } from '@/components/StatsBar'
import { RefreshButton } from '@/components/RefreshButton'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [companies, total, highCount, lastSignal] = await Promise.all([
    prisma.company.findMany({
      orderBy: { intentScore: 'desc' },
      take: 100,
      include: {
        signals: {
          select: {
            source:     true,
            signalType: true,
            rawText:    true,
            url:        true,
            detectedAt: true,
          },
          orderBy: { detectedAt: 'desc' },
          take: 10,
        }
      }
    }),
    prisma.company.count(),
    prisma.company.count({ where: { intentScore: { gte: 70 } } }),
    prisma.signal.findFirst({
      orderBy: { detectedAt: 'desc' },
      select:  { detectedAt: true }
    }),
  ])

  const parsed = companies.map(c => ({
    ...c,
    scoreBreakdown: c.scoreBreakdown ?? null,
    createdAt:  c.createdAt.toISOString(),
    updatedAt:  c.updatedAt.toISOString(),
    signals: c.signals.map(s => ({
      ...s,
      detectedAt: s.detectedAt.toISOString(),
    }))
  }))

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">

      {/* Subtle dot grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          opacity: 0.4,
        }}
      />

      {/* ── HEADER ── */}
      <header className="relative border-b border-gray-200 px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between bg-white/80 backdrop-blur-md top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
            <span className="text-emerald-600 text-xs">⬡</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-gray-900 font-bold tracking-widest text-xs sm:text-sm font-mono">LEADSCOUT</h1>
              <span className="hidden sm:inline text-[9px] font-mono px-1.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded tracking-widest">POC</span>
            </div>
            <p className="text-gray-400 text-[9px] sm:text-[10px] font-mono tracking-widest hidden sm:block">AI LEAD INTELLIGENCE</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse" />
            <span className="text-[9px] font-mono text-emerald-600 hidden sm:inline tracking-widest">LIVE</span>
          </div>
          <RefreshButton />
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="relative px-4 sm:px-8 py-4 sm:py-6 max-w-7xl mx-auto">
        <StatsBar
          total={total}
          highIntent={highCount}
          lastRefreshed={lastSignal?.detectedAt?.toISOString() ?? null}
        />
        <CompanyTable initialCompanies={parsed} />
      </main>
    </div>
  )
}