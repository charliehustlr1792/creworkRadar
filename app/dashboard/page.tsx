import { prisma } from '@/lib/prisma'
import { CompanyTable } from '@/components/CompanyTable'
import { StatsBar } from '@/components/StatsBar'
import { RefreshButton } from '@/components/RefreshButton'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const [companies, total, highCount] = await Promise.all([
    prisma.company.findMany({
      orderBy: { intentScore: 'desc' },
      take: 50,
    }),
    prisma.company.count(),
    prisma.company.count({ where: { intentScore: { gte: 70 } } })
  ])

  // Parse scoreBreakdown string back to object for components
  const parsed = companies.map(c => ({
    ...c,
    scoreBreakdown: c.scoreBreakdown ? JSON.parse(c.scoreBreakdown) : null
  }))

  return (
    <div className="min-h-screen bg-[#07080f] text-white font-mono">
      <header className="border-b border-white/[0.06] px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-emerald-400 font-bold tracking-widest text-sm">⬡ LEADSCOUT</h1>
          <p className="text-zinc-600 text-xs mt-0.5">AI-powered lead intelligence</p>
        </div>
        <RefreshButton />
      </header>

      <main className="px-8 py-6 max-w-7xl mx-auto">
        <StatsBar total={total} highIntent={highCount} />
        <CompanyTable initialCompanies={parsed} />
      </main>
    </div>
  )
}