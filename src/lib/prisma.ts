import { PrismaClient } from '@/generated/prisma'
import { logSql } from './logger'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Check if SQL logging is enabled
const isDebugEnabled =
  process.env.DEBUG === 'true' || process.env.NODE_ENV === 'development'

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isDebugEnabled
      ? [
          { level: 'query', emit: 'event' },
          { level: 'error', emit: 'stdout' },
          { level: 'warn', emit: 'stdout' },
        ]
      : [],
  })

// Subscribe to Prisma query events for unified logging
if (isDebugEnabled) {
  prisma.$on(
    'query' as never,
    (e: { query: string; params: string; duration: number }) => {
      // Parse params (Prisma gives them as a JSON string)
      let parsedParams: unknown[]
      try {
        parsedParams = JSON.parse(e.params)
      } catch {
        parsedParams = []
      }

      logSql(e.query, parsedParams, e.duration)
    }
  )
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
