// src/app/api/reports/daily-totals/route.ts - Today's animal count and revenue
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const now = new Date()
  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    0,
    0,
    0,
    0
  )
  const end = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999
  )

  // Fetch animals with today's thisvisit
  const todays = await prisma.animal.findMany({
    where: {
      thisvisit: {
        gte: start,
        lte: end,
      },
    },
    select: {
      cost: true,
    },
  })

  const totalAnimalsToday = todays.length
  const totalRevenueToday = todays.reduce((sum, a) => {
    const val =
      typeof a.cost === 'number'
        ? a.cost
        : a.cost
          ? Number(a.cost as unknown as string)
          : 0
    return sum + (isNaN(val) ? 0 : val)
  }, 0)

  return NextResponse.json({
    dateTime: now.toISOString(),
    totalAnimalsToday,
    totalRevenueToday,
  })
}
