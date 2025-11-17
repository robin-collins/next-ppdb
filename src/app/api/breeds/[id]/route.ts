// src/app/api/breeds/[id]/route.ts - Update and delete breed
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const breedID = parseInt(id)
  const breed = await prisma.breed.findUnique({ where: { breedID } })
  if (!breed) {
    return NextResponse.json({ error: 'Breed not found' }, { status: 404 })
  }
  return NextResponse.json({
    id: breed.breedID,
    name: breed.breedname,
    avgtime: breed.avgtime,
    avgcost: breed.avgcost,
  })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const breedID = parseInt(id)
  const body = await request.json()

  const name = body?.name as string | undefined
  const avgtimeInput = (body?.avgtime ?? null) as string | null

  // Convert avgtime string (e.g., "45" minutes) to MySQL TIME format (HH:MM:SS)
  let avgtime: Date | null | undefined = undefined
  if (avgtimeInput !== undefined) {
    if (avgtimeInput === null) {
      avgtime = null
    } else if (typeof avgtimeInput === 'string') {
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
  }

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

  const updated = await prisma.breed.update({
    where: { breedID },
    data: {
      ...(name !== undefined && { breedname: name }),
      ...(avgtime !== undefined && { avgtime }),
      avgcost: avgcost,
    },
  })

  return NextResponse.json({
    id: updated.breedID,
    name: updated.breedname,
    avgtime: updated.avgtime,
    avgcost: updated.avgcost,
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const breedID = parseInt(id)

  // Ensure no animals reference this breed before delete (legacy may not enforce FKs)
  const count = await prisma.animal.count({
    where: { breedID },
  })
  if (count > 0) {
    return NextResponse.json(
      {
        error: 'Cannot delete breed with associated animals',
        details: `There are ${count} animal(s) using this breed.`,
      },
      { status: 400 }
    )
  }

  await prisma.breed.delete({
    where: { breedID },
  })
  return NextResponse.json({ success: true })
}
