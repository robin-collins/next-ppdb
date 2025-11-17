// src/app/api/animals/[id]/notes/route.ts - Animal notes endpoints
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/animals/[id]/notes - List animal's service notes
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
}

// POST /api/animals/[id]/notes - Create service note for animal
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const created = await prisma.notes.create({
    data: {
      animalID,
      notes: text,
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
}
