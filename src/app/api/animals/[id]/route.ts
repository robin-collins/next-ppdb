// src/app/api/animals/[id]/route.ts - Individual Animal CRUD
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateAnimalSchema } from '@/lib/validations/animal'
import type { Prisma } from '@/generated/prisma'
import { withRateLimit } from '@/lib/middleware/rateLimit'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRateLimit(
    request,
    async () => {
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
        serviceNotes: animal.notes.map(
          (note: Prisma.notesGetPayload<object>) => ({
            id: note.noteID,
            animalId: note.animalID,
            notes: note.notes,
            serviceDate: note.date,
          })
        ),
      }

      return NextResponse.json(transformedAnimal)
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
      const body = await request.json()

      // Validate request body with Zod
      const validationResult = updateAnimalSchema.safeParse(body)

      if (!validationResult.success) {
        return NextResponse.json(
          {
            error: 'Invalid request data',
            details: validationResult.error.issues,
          },
          { status: 400 }
        )
      }

      const data = validationResult.data

      // Check if animal exists
      const existingAnimal = await prisma.animal.findUnique({
        where: { animalID: parseInt(id) },
      })
      if (!existingAnimal) {
        return NextResponse.json({ error: 'Animal not found' }, { status: 404 })
      }

      // If breed name is provided, look up the breedID
      let breedID: number | undefined = undefined
      if (data.breed) {
        const breed = await prisma.breed.findUnique({
          where: { breedname: data.breed },
        })
        if (!breed) {
          return NextResponse.json(
            {
              error: 'Breed not found',
              details: `Breed "${data.breed}" does not exist`,
            },
            { status: 400 }
          )
        }
        breedID = breed.breedID
      }

      const animal = await prisma.animal.update({
        where: { animalID: parseInt(id) },
        data: {
          ...(data.name !== undefined && { animalname: data.name }),
          ...(data.sex !== undefined && {
            SEX: data.sex === 'Male' ? 'Male' : 'Female',
          }),
          ...(data.colour !== undefined && { colour: data.colour }),
          ...(data.cost !== undefined && { cost: data.cost }),
          ...(data.lastVisit !== undefined && {
            lastvisit: new Date(data.lastVisit),
          }),
          ...(data.thisVisit !== undefined && {
            thisvisit: new Date(data.thisVisit),
          }),
          ...(data.comments !== undefined && { comments: data.comments }),
          ...(breedID !== undefined && { breedID }),
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
        serviceNotes: animal.notes.map(
          (note: Prisma.notesGetPayload<object>) => ({
            id: note.noteID,
            animalId: note.animalID,
            notes: note.notes,
            serviceDate: note.date,
          })
        ),
      }

      return NextResponse.json(transformedAnimal)
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
      const animalID = parseInt(id)

      // Check if animal exists
      const existingAnimal = await prisma.animal.findUnique({
        where: { animalID },
      })

      if (!existingAnimal) {
        return NextResponse.json({ error: 'Animal not found' }, { status: 404 })
      }

      // Count notes before deleting for response
      const notesCount = await prisma.notes.count({
        where: { animalID },
      })

      // Best-effort cleanup of related notes before deleting animal (legacy DB may lack FK cascades)
      await prisma.notes.deleteMany({
        where: { animalID },
      })

      await prisma.animal.delete({
        where: { animalID },
      })

      return NextResponse.json({ success: true, deletedNotes: notesCount })
    },
    { type: 'mutation' }
  )
}
