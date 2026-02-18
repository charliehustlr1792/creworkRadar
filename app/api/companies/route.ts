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

  // Prisma's where clause — fully type-safe, TypeScript will catch typos
  const where = {
    intentScore: { gte: minScore },
    ...(industry ? { industry }                                        : {}),
    ...(search   ? { name: { contains: search, mode: 'insensitive' as const } } : {}),
  }

  // Run count and data fetch in parallel
  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      orderBy: { [sortField]: sortOrder },
      skip:    page * PAGE_SIZE,
      take:    PAGE_SIZE,
    }),
    prisma.company.count({ where })
  ])

  return Response.json({ companies, total, page, pageSize: PAGE_SIZE })
}