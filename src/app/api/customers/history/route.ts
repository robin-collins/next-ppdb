// src/app/api/customers/history/route.ts - Inactive customers by months with optional search
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function normalizePhone(input: string | null | undefined): string {
  if (!input) return ''
  return input.replace(/[\s\-\(\)]+/g, '')
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const monthsParam = searchParams.get('months')
  const q = (searchParams.get('q') || '').trim()

  const months = monthsParam ? parseInt(monthsParam, 10) : 12
  const allowed = new Set([12, 24, 36])
  const periodMonths = allowed.has(months) ? months : 12

  // Fetch customers with their animals' visit dates; compute inactivity in application layer
  const customers = await prisma.customer.findMany({
    include: {
      animal: {
        select: {
          lastvisit: true,
          thisvisit: true,
        },
      },
    },
  })

  const now = new Date()
  const qLower = q.toLowerCase()
  const qDigits = normalizePhone(q)

  const enriched = customers.map(c => {
    // Compute latest visit across all animals
    let latest: Date | null = null
    for (const a of c.animal) {
      const dates = [a.lastvisit, a.thisvisit].filter(Boolean) as Date[]
      for (const d of dates) {
        if (!latest || d > latest) latest = d
      }
    }
    // Months since latest (if none, treat as very old)
    const monthsSince =
      latest == null
        ? Number.POSITIVE_INFINITY
        : (now.getTime() - latest.getTime()) / (1000 * 60 * 60 * 24 * 30.4375)

    return {
      id: c.customerID,
      surname: c.surname,
      firstname: c.firstname,
      email: c.email,
      phone1: c.phone1,
      phone2: c.phone2,
      phone3: c.phone3,
      latestVisit: latest,
      monthsSince,
    }
  })

  // Filter by inactivity threshold
  let results = enriched.filter(c => c.monthsSince >= periodMonths)

  // Optional search across surname/email/phones
  if (qLower) {
    results = results.filter(c => {
      const matchText =
        (c.surname || '').toLowerCase().includes(qLower) ||
        (c.firstname || '').toLowerCase().includes(qLower) ||
        (c.email || '').toLowerCase().includes(qLower)
      const matchPhone =
        qDigits.length > 0 &&
        [c.phone1, c.phone2, c.phone3]
          .map(p => normalizePhone(p))
          .some(p => p.includes(qDigits))
      return matchText || matchPhone
    })
  }

  // Compute stats for header
  const total = results.length
  const oldestVisit =
    results
      .map(c => c.latestVisit)
      .filter(Boolean)
      .reduce<Date | null>((oldest, d) => {
        if (!d) return oldest
        if (!oldest || d < oldest) return d
        return oldest
      }, null) || null

  // Sort by surname asc by default
  results.sort((a, b) => {
    const as = (a.surname || '').toLowerCase()
    const bs = (b.surname || '').toLowerCase()
    if (as < bs) return -1
    if (as > bs) return 1
    return 0
  })

  // Shape response
  return NextResponse.json({
    months: periodMonths,
    q,
    total,
    oldestVisit,
    customers: results.map(c => ({
      id: c.id,
      surname: c.surname,
      firstname: c.firstname,
      email: c.email,
      phone1: c.phone1,
      phone2: c.phone2,
      phone3: c.phone3,
      latestVisit: c.latestVisit,
      monthsSince: isFinite(c.monthsSince) ? Math.floor(c.monthsSince) : null,
    })),
  })
}
