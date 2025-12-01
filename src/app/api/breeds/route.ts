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

  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json(
      {
        error: 'Invalid request data',
        details: [{ path: ['name'], message: 'name is required' }],
      },
      { status: 400 }
    )
  }

  const trimmedName = name.trim()

  // Check for duplicate breed name (case-insensitive)
  // MySQL is typically case-insensitive by default with utf8 collation
  // But we use a raw query with LOWER() to ensure consistency
  const existingBreed = await prisma.$queryRaw<{ breedID: number }[]>`
    SELECT breedID FROM breed WHERE LOWER(breedname) = LOWER(${trimmedName}) LIMIT 1
  `

  if (existingBreed.length > 0) {
    return NextResponse.json(
      {
        error: 'A breed with this name already exists',
        details: [{ path: ['name'], message: 'Breed name must be unique' }],
      },
      { status: 409 }
    )
  }

  // Convert avgtime string (e.g., "45" minutes) to MySQL TIME format (HH:MM:SS)
  // Default to 01:00:00 (1 hour) if not provided
  let avgtime: Date
  if (avgtimeInput && typeof avgtimeInput === 'string' && avgtimeInput.trim()) {
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
    } else {
      // Invalid format, use default
      avgtime = new Date('1970-01-01T01:00:00.000Z')
    }
  } else {
    // Default to 1 hour (01:00:00)
    avgtime = new Date('1970-01-01T01:00:00.000Z')
  }

  // Accept string or number for avgcost; store as number
  // Default to lowest existing avgcost if not provided
  const avgcostInput = body?.avgcost
  let avgcost: number

  if (
    avgcostInput !== undefined &&
    avgcostInput !== null &&
    avgcostInput !== ''
  ) {
    if (typeof avgcostInput === 'number') {
      avgcost = avgcostInput
    } else if (
      typeof avgcostInput === 'string' &&
      !isNaN(Number(avgcostInput))
    ) {
      avgcost = Number(avgcostInput)
    } else {
      // Invalid input, will use default below
      avgcost = -1 // Sentinel to trigger default lookup
    }
  } else {
    avgcost = -1 // Sentinel to trigger default lookup
  }

  // If avgcost needs a default, get the minimum avgcost from existing breeds
  if (avgcost < 0) {
    const minCostBreed = await prisma.breed.aggregate({
      _min: {
        avgcost: true,
      },
      where: {
        avgcost: {
          not: null,
        },
      },
    })
    // Use the minimum cost, or default to 0 if no breeds exist
    avgcost = minCostBreed._min.avgcost ?? 0
  }

  const created = await prisma.breed.create({
    data: {
      breedname: trimmedName,
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
