import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const sortField = searchParams.get('sort') === 'signal_count' ? 'signalCount' : 'intentScore'
  const sortOrder = (searchParams.get('order') || 'desc') as 'asc' | 'desc'
  const industry  = searchParams.get('industry')
  const minScore  = parseInt(searchParams.get('min_score') || '0')
  const search    = searchParams.get('search') || ''
  const page      = parseInt(searchParams.get('page') || '0')
  const PAGE_SIZE = 25

  // Note: SQLite does not support mode: 'insensitive' — removed from contains
  const where = {
    intentScore: { gte: minScore },
    ...(industry ? { industry } : {}),
    ...(search   ? { name: { contains: search } } : {}),
  }

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      orderBy: { [sortField]: sortOrder },
      skip: page * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.company.count({ where })
  ])

  // Parse scoreBreakdown string back to object for the response
  const parsed = companies.map(c => ({
    ...c,
    scoreBreakdown: c.scoreBreakdown ? JSON.parse(c.scoreBreakdown) : null
  }))

  return Response.json({ companies: parsed, total, page, pageSize: PAGE_SIZE })
}