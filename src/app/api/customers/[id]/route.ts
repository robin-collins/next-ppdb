// src/app/api/customers/[id]/route.ts - Get, Update, Delete single customer
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateCustomerSchema } from '@/lib/validations/customer'
import type { Prisma } from '@/generated/prisma'
import { logError } from '@/lib/logger'
import { withRateLimit } from '@/lib/middleware/rateLimit'

// GET /api/customers/[id] - Get single customer with all animals
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRateLimit(
    request,
    async () => {
      try {
        const { id } = await params
        const customerId = parseInt(id)

        if (isNaN(customerId)) {
          return NextResponse.json(
            { error: 'Invalid customer ID' },
            { status: 400 }
          )
        }

        const customer = await prisma.customer.findUnique({
          where: { customerID: customerId },
          include: {
            animal: {
              include: {
                breed: true,
                notes: {
                  select: { date: true },
                  orderBy: { date: 'asc' },
                },
              },
              orderBy: { animalname: 'asc' },
            },
          },
        })

        if (!customer) {
          return NextResponse.json(
            { error: 'Customer not found' },
            { status: 404 }
          )
        }

        // Collect all note dates across all animals
        const allNoteDates: Date[] = []
        customer.animal.forEach(animal => {
          animal.notes.forEach(note => {
            // Filter out invalid dates (0000-00-00)
            if (note.date && note.date.getFullYear() > 1900) {
              allNoteDates.push(note.date)
            }
          })
        })

        // Calculate notes statistics
        const totalNotesCount = allNoteDates.length
        let earliestNoteDate: Date | null = null
        let latestNoteDate: Date | null = null

        if (allNoteDates.length > 0) {
          earliestNoteDate = new Date(
            Math.min(...allNoteDates.map(d => d.getTime()))
          )
          latestNoteDate = new Date(
            Math.max(...allNoteDates.map(d => d.getTime()))
          )
        }

        // Transform to API format
        const transformedCustomer = {
          id: customer.customerID,
          surname: customer.surname,
          firstname: customer.firstname,
          address: customer.address,
          suburb: customer.suburb,
          postcode: customer.postcode
            ? customer.postcode.toString().padStart(4, '0')
            : null,
          phone1: customer.phone1,
          phone2: customer.phone2,
          phone3: customer.phone3,
          email: customer.email,
          animalCount: customer.animal.length,
          animals: customer.animal.map(animal => ({
            id: animal.animalID,
            name: animal.animalname,
            breed: animal.breed.breedname,
            breedId: animal.breedID,
            sex: animal.SEX,
            colour: animal.colour,
            cost: animal.cost,
            lastVisit: animal.lastvisit,
            thisVisit: animal.thisvisit,
            comments: animal.comments,
            notesCount: animal.notes.length,
          })),
          // Statistics for CustomerStatsCard
          totalNotesCount,
          earliestNoteDate,
          latestNoteDate,
        }

        return NextResponse.json(transformedCustomer)
      } catch (error) {
        logError('Error fetching customer', error)
        return NextResponse.json(
          { error: 'Failed to fetch customer' },
          { status: 500 }
        )
      }
    },
    { type: 'api' }
  )
}

// PUT /api/customers/[id] - Update customer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRateLimit(
    request,
    async () => {
      try {
        const { id } = await params
        const customerId = parseInt(id)

        if (isNaN(customerId)) {
          return NextResponse.json(
            { error: 'Invalid customer ID' },
            { status: 400 }
          )
        }

        const body = await request.json()

        // Validate request body with Zod
        const validationResult = updateCustomerSchema.safeParse(body)

        if (!validationResult.success) {
          // Transform Zod errors into field-level errors for the client
          const fieldErrors: Record<string, string> = {}
          for (const issue of validationResult.error.issues) {
            const fieldName = issue.path[0]?.toString() || 'unknown'
            // Only keep the first error for each field
            if (!fieldErrors[fieldName]) {
              fieldErrors[fieldName] = issue.message
            }
          }

          return NextResponse.json(
            {
              error: 'Validation failed',
              message:
                'Some fields contain invalid data. Please correct the highlighted fields.',
              fieldErrors,
              details: validationResult.error.issues,
            },
            { status: 400 }
          )
        }

        const data = validationResult.data

        // Check if customer exists
        const existingCustomer = await prisma.customer.findUnique({
          where: { customerID: customerId },
        })

        if (!existingCustomer) {
          return NextResponse.json(
            { error: 'Customer not found' },
            { status: 404 }
          )
        }

        // Update customer - build update data object to handle null values properly
        const updateData: Prisma.customerUpdateInput = {}

        if (data.surname !== undefined) updateData.surname = data.surname
        if (data.firstname !== undefined) updateData.firstname = data.firstname
        if (data.address !== undefined) updateData.address = data.address
        if (data.suburb !== undefined) updateData.suburb = data.suburb
        if (data.postcode !== undefined) updateData.postcode = data.postcode
        if (data.phone1 !== undefined) updateData.phone1 = data.phone1
        if (data.phone2 !== undefined) updateData.phone2 = data.phone2
        if (data.phone3 !== undefined) updateData.phone3 = data.phone3
        if (data.email !== undefined) updateData.email = data.email

        const customer = await prisma.customer.update({
          where: { customerID: customerId },
          data: updateData,
          include: {
            animal: {
              include: { breed: true },
              orderBy: { animalname: 'asc' },
            },
          },
        })

        // Transform the response to match API interface
        const transformedCustomer = {
          id: customer.customerID,
          surname: customer.surname,
          firstname: customer.firstname,
          address: customer.address,
          suburb: customer.suburb,
          postcode: customer.postcode
            ? customer.postcode.toString().padStart(4, '0')
            : null,
          phone1: customer.phone1,
          phone2: customer.phone2,
          phone3: customer.phone3,
          email: customer.email,
          animalCount: customer.animal.length,
          animals: customer.animal.map(animal => ({
            id: animal.animalID,
            name: animal.animalname,
            breed: animal.breed.breedname,
            breedId: animal.breedID,
            sex: animal.SEX,
            colour: animal.colour,
            cost: animal.cost,
            lastVisit: animal.lastvisit,
            thisVisit: animal.thisvisit,
            comments: animal.comments,
          })),
        }

        return NextResponse.json(transformedCustomer)
      } catch (error) {
        logError('Error updating customer', error)
        return NextResponse.json(
          { error: 'Failed to update customer' },
          { status: 500 }
        )
      }
    },
    { type: 'mutation' }
  )
}

// DELETE /api/customers/[id] - Delete customer (with optional selective animal migration)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRateLimit(
    request,
    async () => {
      try {
        const { id } = await params
        const customerId = parseInt(id)

        if (isNaN(customerId)) {
          return NextResponse.json(
            { error: 'Invalid customer ID' },
            { status: 400 }
          )
        }

        // Check for body with migrateToCustomerId, animalIds, or deleteAnimals
        let migrateToCustomerId: number | null = null
        let animalIdsToMigrate: number[] = []
        let deleteAnimalsExplicitly = false
        let animalIdsToDelete: number[] = []
        try {
          const body = await request.json()
          if (body?.migrateToCustomerId) {
            migrateToCustomerId = parseInt(body.migrateToCustomerId)
          }
          if (Array.isArray(body?.animalIds)) {
            const parsedIds = body.animalIds.map((id: number | string) =>
              parseInt(String(id))
            )
            if (body?.deleteAnimals === true) {
              // User explicitly wants to delete these animals
              deleteAnimalsExplicitly = true
              animalIdsToDelete = parsedIds
            } else {
              animalIdsToMigrate = parsedIds
            }
          }
        } catch {
          // No body or invalid JSON - proceed without migration
        }

        // Check if customer exists
        const existingCustomer = await prisma.customer.findUnique({
          where: { customerID: customerId },
        })

        if (!existingCustomer) {
          return NextResponse.json(
            { error: 'Customer not found' },
            { status: 404 }
          )
        }

        // Get all animals belonging to this customer
        const customerAnimals = await prisma.animal.findMany({
          where: { customerID: customerId },
          select: { animalID: true },
        })
        const allAnimalIds = customerAnimals.map(a => a.animalID)

        let migratedCount = 0
        let deletedAnimalsCount = 0

        if (allAnimalIds.length > 0) {
          // Determine which animals to migrate vs delete
          let animalsToMigrate: number[] = []

          if (animalIdsToMigrate.length > 0 && migrateToCustomerId) {
            animalsToMigrate = allAnimalIds.filter(id =>
              animalIdsToMigrate.includes(id)
            )
          }

          // Animals to delete: explicitly requested OR not selected for migration
          const animalsToDelete = deleteAnimalsExplicitly
            ? allAnimalIds.filter(id => animalIdsToDelete.includes(id))
            : allAnimalIds.filter(id => !animalsToMigrate.includes(id))

          // If there are animals to migrate, verify target customer
          if (animalsToMigrate.length > 0) {
            if (!migrateToCustomerId) {
              return NextResponse.json(
                {
                  error: 'Migration target required for selected animals',
                  details: `Please select a customer to rehome the selected animals to.`,
                },
                { status: 400 }
              )
            }

            const targetCustomer = await prisma.customer.findUnique({
              where: { customerID: migrateToCustomerId },
            })
            if (!targetCustomer) {
              return NextResponse.json(
                { error: 'Migration target customer not found' },
                { status: 400 }
              )
            }

            // Migrate selected animals to the new customer
            const migrationResult = await prisma.animal.updateMany({
              where: {
                animalID: { in: animalsToMigrate },
                customerID: customerId,
              },
              data: { customerID: migrateToCustomerId },
            })
            migratedCount = migrationResult.count
          }

          // Delete animals that weren't selected for migration (cascade deletes their notes)
          if (animalsToDelete.length > 0) {
            // First delete notes for these animals
            await prisma.notes.deleteMany({
              where: { animalID: { in: animalsToDelete } },
            })

            // Then delete the animals
            const deleteResult = await prisma.animal.deleteMany({
              where: {
                animalID: { in: animalsToDelete },
                customerID: customerId,
              },
            })
            deletedAnimalsCount = deleteResult.count
          }
        }

        // Delete customer
        await prisma.customer.delete({
          where: { customerID: customerId },
        })

        return NextResponse.json({
          success: true,
          message: 'Customer deleted successfully',
          migratedAnimals: migratedCount,
          deletedAnimals: deletedAnimalsCount,
        })
      } catch (error) {
        logError('Error deleting customer', error)
        return NextResponse.json(
          { error: 'Failed to delete customer' },
          { status: 500 }
        )
      }
    },
    { type: 'mutation' }
  )
}
