// src/app/api/reports/staff-summary/route.ts - Daily staff work summary report
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withRateLimit } from '@/lib/middleware/rateLimit'
import { extractStaffInitials } from '@/services/notes.service'

/**
 * Staff work summary for a specific date
 */
export interface StaffWorkSummary {
  initials: string
  breeds: Record<string, number>
  totalAnimals: number
}

export interface StaffWorkSummaryResponse {
  date: string
  staff: StaffWorkSummary[]
}

/**
 * GET /api/reports/staff-summary?date=YYYY-MM-DD
 *
 * Returns breakdown of how many animals each staff member worked on for a given date,
 * grouped by staff initials with breed-level breakdown.
 */
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

      // Fetch animals with thisvisit on the target date, including their notes and breed
      const animals = await prisma.animal.findMany({
        where: {
          thisvisit: {
            gte: start,
            lte: end,
          },
        },
        include: {
          breed: {
            select: {
              breedname: true,
            },
          },
          notes: {
            where: {
              date: {
                gte: start,
                lte: end,
              },
            },
            select: {
              notes: true,
            },
          },
        },
      })

      // Map: staff initials -> Set of animalIDs -> breed name
      // This ensures each animal is counted only once per staff member
      const staffData = new Map<
        string,
        Map<number, string> // animalID -> breedName
      >()

      for (const animal of animals) {
        const breedName = animal.breed?.breedname || 'Unknown'

        for (const note of animal.notes) {
          const initials = extractStaffInitials(note.notes)

          if (initials) {
            if (!staffData.has(initials)) {
              staffData.set(initials, new Map())
            }

            // Only add if this animal hasn't been counted for this staff member
            const animalMap = staffData.get(initials)!
            if (!animalMap.has(animal.animalID)) {
              animalMap.set(animal.animalID, breedName)
            }
          }
        }
      }

      // Transform to response format
      const staff: StaffWorkSummary[] = []

      for (const [initials, animalMap] of staffData) {
        // Count breeds
        const breeds: Record<string, number> = {}
        for (const breedName of animalMap.values()) {
          breeds[breedName] = (breeds[breedName] || 0) + 1
        }

        staff.push({
          initials,
          breeds,
          totalAnimals: animalMap.size,
        })
      }

      // Sort by total animals descending
      staff.sort((a, b) => b.totalAnimals - a.totalAnimals)

      const response: StaffWorkSummaryResponse = {
        date: start.toISOString().split('T')[0],
        staff,
      }

      return NextResponse.json(response)
    },
    { type: 'api' }
  )
}
