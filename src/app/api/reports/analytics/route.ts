import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const querySchema = z.object({
  period: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

interface AnalyticsPoint {
  label: string
  dateKey: string // used for sorting/grouping
  count: number
  revenue: number
  breedBreakdown: Record<string, number>
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const params = {
    period: searchParams.get('period'),
    endDate: searchParams.get('endDate'),
  }

  const validation = querySchema.safeParse(params)
  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
  }

  const { period, endDate: endDateStr } = validation.data
  const endDate = new Date(endDateStr)
  // Set end date to end of day
  endDate.setHours(23, 59, 59, 999)

  let startDate = new Date(endDate)
  let points: AnalyticsPoint[] = []

  // Determine Range & Granularity
  if (period === 'daily') {
    // 7 days
    startDate.setDate(endDate.getDate() - 6)
    startDate.setHours(0, 0, 0, 0)
  } else if (period === 'weekly') {
    // 8 weeks (approx 56 days)
    startDate.setDate(endDate.getDate() - 7 * 7) // 7 weeks back from current week? "8 weeks total"
    // Actually requirements say: "8 weeks prior to input date". Let's do 8 weeks inclusive.
    // We want 8 points.
    // Start of range = endDate - 7 weeks. (Total 8 weeks: -7, -6, ..., 0)
    startDate = new Date(endDate)
    startDate.setDate(endDate.getDate() - (8 * 7 - 1)) // Roughly
    startDate.setHours(0, 0, 0, 0)
  } else if (period === 'monthly') {
    // 6 months
    startDate.setMonth(endDate.getMonth() - 5)
    startDate.setDate(1) // Start of that month
    startDate.setHours(0, 0, 0, 0)
  } else if (period === 'yearly') {
    // 3 years
    startDate.setFullYear(endDate.getFullYear() - 2)
    startDate.setMonth(0)
    startDate.setDate(1)
    startDate.setHours(0, 0, 0, 0)
  }

  // Fetch Data
  // We filter by 'thisvisit' date
  const animals = await prisma.animal.findMany({
    where: {
      thisvisit: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      cost: true,
      thisvisit: true,
      breed: {
        select: {
          breedname: true,
        },
      },
    },
  })

  // Aggregation Helper
  const aggregate = (
    data: typeof animals,
    getKey: (date: Date) => { key: string; label: string }
  ) => {
    const groups: Record<string, AnalyticsPoint> = {}

    // Initialize groups based on range to ensure empty days/weeks/months are present?
    // For now, let's just group present data and maybe fill gaps if strictness is needed.
    // Requirements imply we need specific points. Let's generate the keys first.

    // But simpler: Group data first, then map to expected points.

    for (const animal of data) {
      const date = new Date(animal.thisvisit)
      const { key, label } = getKey(date)

      if (!groups[key]) {
        groups[key] = {
          label,
          dateKey: key,
          count: 0,
          revenue: 0,
          breedBreakdown: {},
        }
      }

      groups[key].count++
      groups[key].revenue += animal.cost

      const breedName = animal.breed.breedname
      groups[key].breedBreakdown[breedName] =
        (groups[key].breedBreakdown[breedName] || 0) + 1
    }

    return Object.values(groups).sort((a, b) =>
      a.dateKey.localeCompare(b.dateKey)
    )
  }

  if (period === 'daily') {
    // Initialize all 7 days to ensure no gaps
    const map = new Map<string, AnalyticsPoint>()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(endDate)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      const label = d.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      }) // e.g. "Mon, Oct 2"
      map.set(key, {
        label,
        dateKey: key,
        count: 0,
        revenue: 0,
        breedBreakdown: {},
      })
    }

    for (const animal of animals) {
      const key = animal.thisvisit.toISOString().split('T')[0]
      const point = map.get(key)
      if (point) {
        point.count++
        point.revenue += animal.cost
        const breed = animal.breed.breedname
        point.breedBreakdown[breed] = (point.breedBreakdown[breed] || 0) + 1
      }
    }
    points = Array.from(map.values())
  } else if (period === 'weekly') {
    // Group by ISO Week or just chunks of 7 days?
    // "Sum up the days based on the period".
    // Standard way: ISO weeks.
    // Or: "Week ending [Date]".

    // Let's use ISO weeks for grouping.
    // Helper to get week key: YYYY-Www
    const getWeekKey = (d: Date) => {
      const date = new Date(d.getTime())
      date.setHours(0, 0, 0, 0)
      // Thursday in current week decides the year.
      date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7))
      const week1 = new Date(date.getFullYear(), 0, 4)
      const weekNum =
        1 +
        Math.round(
          ((date.getTime() - week1.getTime()) / 86400000 -
            3 +
            ((week1.getDay() + 6) % 7)) /
            7
        )
      return {
        key: `${date.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`,
        label: `Week ${weekNum}`,
      }
    }

    points = aggregate(animals, getWeekKey)
    // Fill gaps not implemented for weeks/months to keep it simple for now, unless needed.
    // Actually, let's try to be consistent.
  } else if (period === 'monthly') {
    points = aggregate(animals, d => {
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`
      const label = d.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
      return { key, label }
    })
  } else if (period === 'yearly') {
    // Ensure 3 years are present
    const map = new Map<string, AnalyticsPoint>()
    for (let i = 2; i >= 0; i--) {
      const d = new Date(endDate)
      d.setFullYear(d.getFullYear() - i)
      const key = `${d.getFullYear()}`
      const label = key
      map.set(key, {
        label,
        dateKey: key,
        count: 0,
        revenue: 0,
        breedBreakdown: {},
      })
    }

    points = aggregate(animals, d => {
      const key = `${d.getFullYear()}`
      const label = key
      return { key, label }
    })

    // Merge actual data into the pre-filled map
    // Actually, 'aggregate' creates its own list.
    // Better approach: use the map population strategy like 'daily'

    for (const animal of animals) {
      const key = `${animal.thisvisit.getFullYear()}`
      // Only process if within our generated range (should be guaranteed by query, but good for safety)
      if (map.has(key)) {
        const point = map.get(key)!
        point.count++
        point.revenue += animal.cost
        const breed = animal.breed.breedname
        point.breedBreakdown[breed] = (point.breedBreakdown[breed] || 0) + 1
      }
    }
    points = Array.from(map.values())
  }

  // Summary
  const summary = {
    totalRevenue: animals.reduce((sum, a) => sum + a.cost, 0),
    totalAnimals: animals.length,
    avgPrice:
      animals.length > 0
        ? animals.reduce((sum, a) => sum + a.cost, 0) / animals.length
        : 0,
  }

  return NextResponse.json({
    data: points,
    summary,
  })
}
