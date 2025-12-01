// src/app/api/breeds/[id]/animals/count/route.ts - Get count of animals using a breed
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const breedID = parseInt(id)

  if (isNaN(breedID)) {
    return NextResponse.json({ error: 'Invalid breed ID' }, { status: 400 })
  }

  const count = await prisma.animal.count({
    where: { breedID },
  })

  return NextResponse.json({ count })
}
