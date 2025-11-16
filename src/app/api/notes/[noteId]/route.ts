// src/app/api/notes/[noteId]/route.ts - Delete a specific service note
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ noteId: string }> }
) {
  const { noteId } = await params
  const id = parseInt(noteId)

  await prisma.notes.delete({
    where: { noteID: id },
  })

  return NextResponse.json({ success: true })
}
