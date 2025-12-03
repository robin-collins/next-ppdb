// src/app/api/animals/[id]/notes/count/route.ts - Get count of notes for an animal
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withRateLimit } from '@/lib/middleware/rateLimit'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRateLimit(
    request,
    async () => {
      const { id } = await params
      const animalID = parseInt(id)

      if (isNaN(animalID)) {
        return NextResponse.json(
          { error: 'Invalid animal ID' },
          { status: 400 }
        )
      }

      const count = await prisma.notes.count({
        where: { animalID },
      })

      return NextResponse.json({ count })
    },
    { type: 'api' }
  )
}
