// src/app/api/animals/[id]/route.ts - Individual Animal CRUD
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateAnimalSchema } from '@/lib/validations/animal'
import type { Prisma } from '@/generated/prisma'
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const animal = await prisma.animal.findUnique({
    where: { animalID: parseInt(id) },
    include: {
      customer: true,
      breed: true,
      notes: {
        orderBy: { date: 'desc' },
      },
    },
  })

  if (!animal) {
    return NextResponse.json({ error: 'Animal not found' }, { status: 404 })
  }

  // Transform the response to match API interface
  const transformedAnimal = {
    id: animal.animalID,
    name: animal.animalname,
    breed: animal.breed.breedname,
    colour: animal.colour,
    sex: animal.SEX,
    cost: animal.cost,
    lastVisit: animal.lastvisit,
    thisVisit: animal.thisvisit,
    comments: animal.comments,
    customer: {
      id: animal.customer.customerID,
      surname: animal.customer.surname,
      firstname: animal.customer.firstname,
      address: animal.customer.address,
      suburb: animal.customer.suburb,
      postcode: animal.customer.postcode,
      phone1: animal.customer.phone1,
      phone2: animal.customer.phone2,
      phone3: animal.customer.phone3,
      email: animal.customer.email,
    },
    serviceNotes: animal.notes.map((note: Prisma.notesGetPayload<object>) => ({
      id: note.noteID,
      animalId: note.animalID,
      notes: note.notes,
      serviceDate: note.date,
    })),
  }

  return NextResponse.json(transformedAnimal)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  // Validate request body with Zod
  const validationResult = updateAnimalSchema.safeParse(body)

  if (!validationResult.success) {
    return NextResponse.json(
      { error: 'Invalid request data', details: validationResult.error.issues },
      { status: 400 }
    )
  }

  const data = validationResult.data

  const animal = await prisma.animal.update({
    where: { animalID: parseInt(id) },
    data: {
      animalname: data.name,
      SEX: data.sex === 'Male' ? 'Male' : 'Female',
      colour: data.colour,
      cost: data.cost,
      lastvisit: data.lastVisit ? new Date(data.lastVisit) : undefined,
      thisvisit: data.thisVisit ? new Date(data.thisVisit) : undefined,
      comments: data.comments,
    },
    include: { customer: true, breed: true, notes: true },
  })

  // Transform the response to match API interface
  const transformedAnimal = {
    id: animal.animalID,
    name: animal.animalname,
    breed: animal.breed.breedname,
    colour: animal.colour,
    sex: animal.SEX,
    cost: animal.cost,
    lastVisit: animal.lastvisit,
    thisVisit: animal.thisvisit,
    comments: animal.comments,
    customer: {
      id: animal.customer.customerID,
      surname: animal.customer.surname,
      firstname: animal.customer.firstname,
      address: animal.customer.address,
      suburb: animal.customer.suburb,
      postcode: animal.customer.postcode,
      phone1: animal.customer.phone1,
      phone2: animal.customer.phone2,
      phone3: animal.customer.phone3,
      email: animal.customer.email,
    },
    serviceNotes: animal.notes.map((note: Prisma.notesGetPayload<object>) => ({
      id: note.noteID,
      animalId: note.animalID,
      notes: note.notes,
      serviceDate: note.date,
    })),
  }

  return NextResponse.json(transformedAnimal)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const animalID = parseInt(id)

  // Best-effort cleanup of related notes before deleting animal (legacy DB may lack FK cascades)
  await prisma.notes.deleteMany({
    where: { animalID },
  })

  await prisma.animal.delete({
    where: { animalID },
  })

  return NextResponse.json({ success: true })
}
