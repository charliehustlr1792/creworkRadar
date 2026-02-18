import type { Company, Signal } from '@prisma/client'

// Re-export Prisma types for use across the app
export type { Company, Signal }

// Extended type for API responses that include relations
export type CompanyWithSignals = Company & {
  signals: Signal[]
}