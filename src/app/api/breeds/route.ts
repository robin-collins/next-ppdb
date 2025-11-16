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
  const avgtime: string | null | undefined = body?.avgtime ?? null
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
