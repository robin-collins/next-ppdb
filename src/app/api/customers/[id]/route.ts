// src/app/api/customers/[id]/route.ts - Get, Update, Delete single customer
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateCustomerSchema } from '@/lib/validations/customer'

// GET /api/customers/[id] - Get single customer with all animals
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = parseInt(params.id)

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
          include: { breed: true },
          orderBy: { animalname: 'asc' },
        },
      },
    })

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
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
      })),
    }

    return NextResponse.json(transformedCustomer)
  } catch (error) {
    console.error('Error fetching customer:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    )
  }
}

// PUT /api/customers/[id] - Update customer
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = parseInt(params.id)

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
      return NextResponse.json(
        {
          error: 'Invalid request data',
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
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Update customer
    const customer = await prisma.customer.update({
      where: { customerID: customerId },
      data: {
        ...(data.surname !== undefined && { surname: data.surname }),
        ...(data.firstname !== undefined && {
          firstname: data.firstname || null,
        }),
        ...(data.address !== undefined && { address: data.address || null }),
        ...(data.suburb !== undefined && { suburb: data.suburb || null }),
        ...(data.postcode !== undefined && { postcode: data.postcode || null }),
        ...(data.phone1 !== undefined && { phone1: data.phone1 || null }),
        ...(data.phone2 !== undefined && { phone2: data.phone2 || null }),
        ...(data.phone3 !== undefined && { phone3: data.phone3 || null }),
        ...(data.email !== undefined && { email: data.email || null }),
      },
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
    console.error('Error updating customer:', error)
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    )
  }
}

// DELETE /api/customers/[id] - Delete customer
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = parseInt(params.id)

    if (isNaN(customerId)) {
      return NextResponse.json(
        { error: 'Invalid customer ID' },
        { status: 400 }
      )
    }

    // Check if customer exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { customerID: customerId },
      include: { animal: true },
    })

    if (!existingCustomer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Check if customer has animals (prevent deletion if they do)
    if (existingCustomer.animal.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete customer with associated animals',
          details: `This customer has ${existingCustomer.animal.length} animal(s). Please remove or reassign animals first.`,
        },
        { status: 400 }
      )
    }

    // Delete customer
    await prisma.customer.delete({
      where: { customerID: customerId },
    })

    return NextResponse.json(
      { message: 'Customer deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting customer:', error)
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    )
  }
}
