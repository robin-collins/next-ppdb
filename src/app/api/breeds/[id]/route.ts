// src/app/api/breeds/[id]/route.ts - Update and delete breed
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
    },
    { type: 'api' }
  )
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRateLimit(
    request,
    async () => {
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
    },
    { type: 'mutation' }
  )
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRateLimit(
    request,
    async () => {
      const { id } = await params
      const breedID = parseInt(id)

      // Check for body with migrateToBreedId
      let migrateToBreedId: number | null = null
      try {
        const body = await request.json()
        if (body?.migrateToBreedId) {
          migrateToBreedId = parseInt(body.migrateToBreedId)
        }
      } catch {
        // No body or invalid JSON - proceed without migration
      }

      // Count animals using this breed
      const count = await prisma.animal.count({
        where: { breedID },
      })

      if (count > 0) {
        // If no migration target provided, return error with count
        if (!migrateToBreedId) {
          return NextResponse.json(
            {
              error: 'Cannot delete breed with associated animals',
              details: `There are ${count} animal(s) using this breed.`,
              animalCount: count,
            },
            { status: 400 }
          )
        }

        // Verify the migration target breed exists
        const targetBreed = await prisma.breed.findUnique({
          where: { breedID: migrateToBreedId },
        })
        if (!targetBreed) {
          return NextResponse.json(
            { error: 'Migration target breed not found' },
            { status: 400 }
          )
        }

        // Migrate all animals to the new breed
        await prisma.animal.updateMany({
          where: { breedID },
          data: { breedID: migrateToBreedId },
        })
      }

      // Now safe to delete the breed
      await prisma.breed.delete({
        where: { breedID },
      })

      return NextResponse.json({
        success: true,
        migratedAnimals: count > 0 && migrateToBreedId ? count : 0,
      })
    },
    { type: 'mutation' }
  )
}
