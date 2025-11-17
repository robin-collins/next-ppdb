// src/app/api/notes/[noteId]/route.ts - CRUD for a specific service note
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ noteId: string }> }
) {
  const { noteId } = await params
  const id = parseInt(noteId)
  const note = await prisma.notes.findUnique({ where: { noteID: id } })
  if (!note) {
    return NextResponse.json({ error: 'Note not found' }, { status: 404 })
  }
  return NextResponse.json({
    id: note.noteID,
    animalId: note.animalID,
    serviceDetails: note.notes,
    serviceDate: note.date,
  })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  const { noteId } = await params
  const id = parseInt(noteId)

  // Check if note exists
  const existingNote = await prisma.notes.findUnique({
    where: { noteID: id },
  })
  if (!existingNote) {
    return NextResponse.json({ error: 'Note not found' }, { status: 404 })
  }

  const body = await request.json()
  const updates: {
    notes?: string
    date?: Date
  } = {}
  if (typeof body?.serviceDetails === 'string')
    updates.notes = body.serviceDetails
  if (typeof body?.serviceDate === 'string')
    updates.date = new Date(body.serviceDate)
  const updated = await prisma.notes.update({
    where: { noteID: id },
    data: updates,
  })
  return NextResponse.json({
    id: updated.noteID,
    animalId: updated.animalID,
    serviceDetails: updated.notes,
    serviceDate: updated.date,
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  const { noteId } = await params
  const id = parseInt(noteId)

  // Check if note exists
  const existingNote = await prisma.notes.findUnique({
    where: { noteID: id },
  })

  if (!existingNote) {
    return NextResponse.json({ error: 'Note not found' }, { status: 404 })
  }

  await prisma.notes.delete({
    where: { noteID: id },
  })

  return NextResponse.json({ success: true })
}
