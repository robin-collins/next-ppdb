import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'stdout' },
      { level: 'warn', emit: 'stdout' },
    ],
  })

// Log queries with actual parameter values
prisma.$on('query' as never, (e: any) => {
  console.log('🔍 SQL:', e.query)
  console.log('📦 Params:', e.params)
  console.log('⏱️  Duration:', e.duration + 'ms\n')
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
