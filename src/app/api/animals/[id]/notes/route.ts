// src/app/api/animals/[id]/notes/route.ts - Animal notes endpoints
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withRateLimit } from '@/lib/middleware/rateLimit'

// GET /api/animals/[id]/notes - List animal's service notes
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRateLimit(
    request,
    async () => {
      const { id } = await params
      const animalID = parseInt(id)

      const notes = await prisma.notes.findMany({
        where: { animalID },
        orderBy: { date: 'desc' },
      })

      return NextResponse.json(
        notes.map(note => ({
          noteID: note.noteID,
          animalID: note.animalID,
          notes: note.notes,
          date: note.date.toISOString(),
        }))
      )
    },
    { type: 'api' }
  )
}

// POST /api/animals/[id]/notes - Create service note for animal
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRateLimit(
    request,
    async () => {
      const { id } = await params
      const animalID = parseInt(id)
      const body = await request.json()

      // Expect shape: { notes: string, serviceDate?: string }
      const text: string | undefined = body?.notes
      const serviceDate: string | undefined = body?.serviceDate

      if (!text || typeof text !== 'string') {
        return NextResponse.json(
          {
            error: 'Invalid request data',
            details: [{ path: ['notes'], message: 'notes is required' }],
          },
          { status: 400 }
        )
      }

      // Check if note contains a cost pattern ($XX to $XXXX)
      const hasCostPattern = /\$\d{1,4}/.test(text)

      let finalNoteText = text

      // If no cost in note, auto-add the animal's cost
      if (!hasCostPattern) {
        const animal = await prisma.animal.findUnique({
          where: { animalID },
          select: { cost: true },
        })

        if (animal?.cost) {
          const costStr = `$${animal.cost}`
          // Check if note ends with uppercase word (2+ uppercase letters like "CC", "FF")
          const endsWithUppercase = /\s[A-Z]{2,}$/.test(text.trim())

          if (endsWithUppercase) {
            // Insert cost before the uppercase ending
            const trimmed = text.trim()
            const lastSpaceIdx = trimmed.lastIndexOf(' ')
            const beforeLast = trimmed.slice(0, lastSpaceIdx)
            const lastWord = trimmed.slice(lastSpaceIdx + 1)
            finalNoteText = `${beforeLast} ${costStr} ${lastWord}`
          } else {
            // Append cost at end
            finalNoteText = `${text.trim()} ${costStr}`
          }
        }
      }

      const created = await prisma.notes.create({
        data: {
          animalID,
          notes: finalNoteText,
          date: serviceDate ? new Date(serviceDate) : new Date(),
        },
      })

      return NextResponse.json(
        {
          id: created.noteID,
          animalId: created.animalID,
          notes: created.notes,
          serviceDate: created.date,
        },
        { status: 201 }
      )
    },
    { type: 'mutation' }
  )
}
