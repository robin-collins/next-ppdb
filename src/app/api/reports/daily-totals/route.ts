// src/app/api/reports/daily-totals/route.ts - Daily totals report with detailed animal list
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withRateLimit } from '@/lib/middleware/rateLimit'

export interface DailyTotalAnimal {
  animalID: number
  animalName: string
  ownerName: string
  breedName: string
  cost: number
}

export interface DailyTotalsResponse {
  date: string
  dateTime: string
  animals: DailyTotalAnimal[]
  totalAnimals: number
  totalRevenue: number
}

export async function GET(request: NextRequest) {
  return withRateLimit(
    request,
    async () => {
      // Get date from query param, default to today
      const searchParams = request.nextUrl.searchParams
      const dateParam = searchParams.get('date')

      let targetDate: Date
      if (dateParam) {
        // Parse YYYY-MM-DD format
        targetDate = new Date(dateParam + 'T00:00:00')
        if (isNaN(targetDate.getTime())) {
          return NextResponse.json(
            { error: 'Invalid date format. Use YYYY-MM-DD' },
            { status: 400 }
          )
        }
      } else {
        targetDate = new Date()
      }

      // Create start and end of day
      const start = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        targetDate.getDate(),
        0,
        0,
        0,
        0
      )
      const end = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        targetDate.getDate(),
        23,
        59,
        59,
        999
      )

      // Fetch animals with thisvisit on the target date, including relations
      const animals = await prisma.animal.findMany({
        where: {
          thisvisit: {
            gte: start,
            lte: end,
          },
        },
        include: {
          customer: {
            select: {
              firstname: true,
              surname: true,
            },
          },
          breed: {
            select: {
              breedname: true,
            },
          },
        },
        orderBy: [{ customer: { surname: 'asc' } }, { animalname: 'asc' }],
      })

      // Transform to response format
      const transformedAnimals: DailyTotalAnimal[] = animals.map(animal => {
        const firstName = animal.customer?.firstname || ''
        const surname = animal.customer?.surname || ''
        const ownerName = `${firstName} ${surname}`.trim() || 'Unknown'

        return {
          animalID: animal.animalID,
          animalName: animal.animalname || 'Unknown',
          ownerName,
          breedName: animal.breed?.breedname || 'Unknown',
          cost:
            typeof animal.cost === 'number'
              ? animal.cost
              : Number(animal.cost) || 0,
        }
      })

      const totalAnimals = transformedAnimals.length
      const totalRevenue = transformedAnimals.reduce(
        (sum, a) => sum + a.cost,
        0
      )

      const response: DailyTotalsResponse = {
        date: start.toISOString().split('T')[0],
        dateTime: new Date().toISOString(),
        animals: transformedAnimals,
        totalAnimals,
        totalRevenue,
      }

      return NextResponse.json(response)
    },
    { type: 'api' }
  )
}
