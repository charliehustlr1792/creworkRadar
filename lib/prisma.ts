// src/lib/prisma.ts
// Prisma Singleton Pattern for Next.js
// Prevents multiple instances during hot reload in development

import * as PrismaPkg from '@prisma/client'

const PrismaClientCtor =
  (PrismaPkg as any).PrismaClient ?? (PrismaPkg as any).default ?? (PrismaPkg as any)

const globalForPrisma = globalThis as unknown as {
  prisma: any | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClientCtor({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}