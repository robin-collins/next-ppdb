// src/app/api/breeds/route.ts - List and create breeds
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const breeds = await prisma.breed.findMany({
    orderBy: { breedname: 'asc' },
  })
  return NextResponse.json(
    breeds.map(b => ({
      id: b.breedID,
      name: b.breedname,
      avgtime: b.avgtime,
      avgcost: b.avgcost,
    }))
  )
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const name: string | undefined = body?.name
  const avgtimeInput: string | null | undefined = body?.avgtime ?? null

  // Convert avgtime string (e.g., "45" minutes) to MySQL TIME format (HH:MM:SS)
  let avgtime: Date | null = null
  if (avgtimeInput && typeof avgtimeInput === 'string') {
    // If it's already in HH:MM:SS format, use it directly
    if (/^\d{2}:\d{2}:\d{2}$/.test(avgtimeInput)) {
      avgtime = new Date(`1970-01-01T${avgtimeInput}.000Z`)
    }
    // If it's just a number (minutes), convert to HH:MM:SS
    else if (/^\d+$/.test(avgtimeInput)) {
      const minutes = parseInt(avgtimeInput, 10)
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`
      avgtime = new Date(`1970-01-01T${timeStr}.000Z`)
    }
  }

  // Accept string or number for avgcost; store as string/Decimal-compatible
  const avgcostInput = body?.avgcost
  const avgcost: number | null =
    avgcostInput === undefined || avgcostInput === null
      ? null
      : typeof avgcostInput === 'number'
        ? avgcostInput
        : typeof avgcostInput === 'string'
          ? isNaN(Number(avgcostInput))
            ? null
            : Number(avgcostInput)
          : null

  if (!name || typeof name !== 'string') {
    return NextResponse.json(
      {
        error: 'Invalid request data',
        details: [{ path: ['name'], message: 'name is required' }],
      },
      { status: 400 }
    )
  }

  const created = await prisma.breed.create({
    data: {
      breedname: name,
      avgtime: avgtime,
      avgcost: avgcost,
    },
  })

  return NextResponse.json(
    {
      id: created.breedID,
      name: created.breedname,
      avgtime: created.avgtime,
      avgcost: created.avgcost,
    },
    { status: 201 }
  )
}
