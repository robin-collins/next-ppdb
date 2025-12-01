// src/app/api/breeds/pricing/route.ts - Bulk pricing update for breeds and associated animals
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface PricingUpdateRequest {
  breedId?: number // If provided, only update this breed; otherwise update all breeds
  adjustmentType: 'fixed' | 'percentage'
  adjustmentValue: number // Fixed dollar amount or percentage value
}

interface UpdateSummary {
  breedsUpdated: number
  animalsUpdated: number
  breedDetails: Array<{
    id: number
    name: string
    oldAvgcost: number | null
    newAvgcost: number
    animalsUpdated: number
  }>
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PricingUpdateRequest

    const { breedId, adjustmentType, adjustmentValue } = body

    // Validate request
    if (!adjustmentType || !['fixed', 'percentage'].includes(adjustmentType)) {
      return NextResponse.json(
        { error: 'Invalid adjustment type. Must be "fixed" or "percentage".' },
        { status: 400 }
      )
    }

    if (typeof adjustmentValue !== 'number' || isNaN(adjustmentValue)) {
      return NextResponse.json(
        { error: 'Invalid adjustment value. Must be a number.' },
        { status: 400 }
      )
    }

    if (adjustmentValue <= 0) {
      return NextResponse.json(
        { error: 'Adjustment value must be greater than 0.' },
        { status: 400 }
      )
    }

    // Get breeds to update (without animals - we'll update them via SQL)
    const breeds = await prisma.breed.findMany({
      where: breedId ? { breedID: breedId } : undefined,
      select: {
        breedID: true,
        breedname: true,
        avgcost: true,
      },
    })

    if (breeds.length === 0) {
      return NextResponse.json(
        { error: breedId ? 'Breed not found' : 'No breeds found' },
        { status: 404 }
      )
    }

    const summary: UpdateSummary = {
      breedsUpdated: 0,
      animalsUpdated: 0,
      breedDetails: [],
    }

    // Process each breed - use raw SQL for efficient batch animal updates
    for (const breed of breeds) {
      const oldAvgcost = breed.avgcost ?? 0

      // Calculate new avgcost
      let newAvgcost: number
      if (adjustmentType === 'fixed') {
        newAvgcost = oldAvgcost + adjustmentValue
      } else {
        // Percentage increase
        newAvgcost = Math.round(oldAvgcost * (1 + adjustmentValue / 100))
      }

      // Update breed avgcost
      await prisma.breed.update({
        where: { breedID: breed.breedID },
        data: { avgcost: newAvgcost },
      })

      // Update animals using efficient raw SQL with CASE expressions
      // This handles all three scenarios in a single query:
      // 1. cost < oldAvgcost: apply same adjustment
      // 2. cost > oldAvgcost: preserve difference (newAvgcost + (cost - oldAvgcost))
      // 3. cost = oldAvgcost: apply same adjustment
      // 4. cost = 0: skip (no change)

      let animalsUpdated: number

      if (adjustmentType === 'fixed') {
        // Fixed amount update
        // For cost <= avgcost: add fixed amount
        // For cost > avgcost: newAvgcost + (cost - oldAvgcost) = cost + adjustmentValue
        // Both simplify to: cost + adjustmentValue
        const result = await prisma.$executeRaw`
          UPDATE animal
          SET cost = cost + ${adjustmentValue}
          WHERE breedID = ${breed.breedID}
            AND cost > 0
        `
        animalsUpdated = result
      } else {
        // Percentage update - more complex logic needed
        // For cost <= avgcost: cost * (1 + percentage/100)
        // For cost > avgcost: newAvgcost + (cost - oldAvgcost)
        const multiplier = 1 + adjustmentValue / 100

        const result = await prisma.$executeRaw`
          UPDATE animal
          SET cost = CASE
            WHEN cost <= ${oldAvgcost} THEN ROUND(cost * ${multiplier})
            ELSE ${newAvgcost} + (cost - ${oldAvgcost})
          END
          WHERE breedID = ${breed.breedID}
            AND cost > 0
        `
        animalsUpdated = result
      }

      summary.breedsUpdated++
      summary.animalsUpdated += animalsUpdated
      summary.breedDetails.push({
        id: breed.breedID,
        name: breed.breedname,
        oldAvgcost: breed.avgcost,
        newAvgcost,
        animalsUpdated,
      })
    }

    return NextResponse.json({
      success: true,
      message: `Successfully updated pricing for ${summary.breedsUpdated} breed(s) and ${summary.animalsUpdated} animal(s).`,
      summary,
    })
  } catch (error) {
    console.error('Pricing update error:', error)
    return NextResponse.json(
      { error: 'Failed to update pricing' },
      { status: 500 }
    )
  }
}
