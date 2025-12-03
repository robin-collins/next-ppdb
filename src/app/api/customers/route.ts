// src/app/api/customers/route.ts - Search & List
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  searchCustomersSchema,
  createCustomerSchema,
  normalizePhone,
} from '@/lib/validations/customer'
import type { Prisma } from '@/generated/prisma'
import { logError } from '@/lib/logger'
import { withRateLimit } from '@/lib/middleware/rateLimit'

// Helper function to calculate relevance score for customers
function calculateCustomerRelevanceScore(
  customer: Prisma.customerGetPayload<{
    include: { animal: { include: { breed: true } } }
  }>,
  query: string
): number {
  const lowerQuery = query.toLowerCase().trim()
  let score = 0

  // Check surname (highest priority)
  if (customer.surname?.toLowerCase() === lowerQuery) score += 100
  else if (customer.surname?.toLowerCase().startsWith(lowerQuery)) score += 80
  else if (customer.surname?.toLowerCase().includes(lowerQuery)) score += 50

  // Check firstname
  if (customer.firstname?.toLowerCase() === lowerQuery) score += 90
  else if (customer.firstname?.toLowerCase().startsWith(lowerQuery)) score += 70
  else if (customer.firstname?.toLowerCase().includes(lowerQuery)) score += 40

  // Check phone numbers (normalized)
  const normalizedQuery = normalizePhone(query)
  const phones = [customer.phone1, customer.phone2, customer.phone3].filter(
    Boolean
  )

  for (const phone of phones) {
    if (phone) {
      const normalizedPhone = normalizePhone(phone)
      if (normalizedPhone === normalizedQuery) score += 100
      else if (normalizedPhone.includes(normalizedQuery)) score += 60
    }
  }

  // Check email
  if (customer.email?.toLowerCase() === lowerQuery) score += 100
  else if (customer.email?.toLowerCase().includes(lowerQuery)) score += 50

  // Check suburb
  if (customer.suburb?.toLowerCase().includes(lowerQuery)) score += 30

  return score
}

// GET /api/customers?q=smith&page=1&limit=20
export async function GET(request: NextRequest) {
  return withRateLimit(
    request,
    async () => {
      try {
        const { searchParams } = new URL(request.url)

        // Validate query parameters with Zod
        const validationResult = searchCustomersSchema.safeParse({
          q: searchParams.get('q') || '',
          page: parseInt(searchParams.get('page') || '1'),
          limit: parseInt(searchParams.get('limit') || '20'),
        })

        if (!validationResult.success) {
          return NextResponse.json(
            {
              error: 'Invalid query parameters',
              details: validationResult.error.issues,
            },
            { status: 400 }
          )
        }

        const { q: rawQuery, page, limit } = validationResult.data

        // Trim whitespace from query to handle accidental leading/trailing spaces
        const query = rawQuery.trim()

        // If no query, return paginated list of all customers
        const orConditions: Prisma.customerWhereInput[] = []

        if (query) {
          const isPhoneQuery =
            /^\d[\d\s\-\(\)]*\d$/.test(query) && query.length >= 4
          const normalizedQuery = normalizePhone(query)

          // Build search conditions
          orConditions.push(
            { surname: { contains: query } },
            { firstname: { contains: query } },
            { email: { contains: query } },
            { suburb: { contains: query } }
          )

          if (isPhoneQuery) {
            orConditions.push(
              { phone1: { contains: normalizedQuery } },
              { phone2: { contains: normalizedQuery } },
              { phone3: { contains: normalizedQuery } }
            )
          }
        }

        const where: Prisma.customerWhereInput =
          orConditions.length > 0 ? { OR: orConditions } : {}

        // Fetch customers with their animals
        const [allCustomers, total] = await Promise.all([
          prisma.customer.findMany({
            where,
            include: {
              animal: {
                include: { breed: true },
              },
            },
          }),
          prisma.customer.count({ where }),
        ])

        // Calculate relevance scores if there's a query
        let sortedCustomers = allCustomers
        if (query.trim()) {
          const scored = allCustomers.map(customer => ({
            customer,
            score: calculateCustomerRelevanceScore(customer, query),
          }))
          scored.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score
            return (a.customer.surname || '').localeCompare(
              b.customer.surname || ''
            )
          })
          sortedCustomers = scored.map(s => s.customer)
        } else {
          // Sort alphabetically by surname
          sortedCustomers.sort((a, b) =>
            (a.surname || '').localeCompare(b.surname || '')
          )
        }

        // Apply pagination
        const paginatedCustomers = sortedCustomers.slice(
          (page - 1) * limit,
          page * limit
        )

        // Transform to API format
        const transformedCustomers = paginatedCustomers.map(customer => ({
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
            sex: animal.SEX,
          })),
        }))

        return NextResponse.json({
          customers: transformedCustomers,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        })
      } catch (error) {
        logError('Error fetching customers', error)
        return NextResponse.json(
          { error: 'Failed to fetch customers' },
          { status: 500 }
        )
      }
    },
    { type: 'search' }
  )
}

// POST /api/customers - Create new customer
export async function POST(request: NextRequest) {
  return withRateLimit(
    request,
    async () => {
      try {
        const body = await request.json()

        // Validate request body with Zod
        const validationResult = createCustomerSchema.safeParse(body)

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

        // Create customer in database
        const customer = await prisma.customer.create({
          data: {
            surname: data.surname,
            firstname: data.firstname || null,
            address: data.address || null,
            suburb: data.suburb || null,
            postcode: data.postcode || null,
            phone1: data.phone1 || null,
            phone2: data.phone2 || null,
            phone3: data.phone3 || null,
            email: data.email || null,
          },
          include: {
            animal: {
              include: { breed: true },
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
            sex: animal.SEX,
          })),
        }

        return NextResponse.json(transformedCustomer, { status: 201 })
      } catch (error) {
        logError('Error creating customer', error)
        return NextResponse.json(
          { error: 'Failed to create customer' },
          { status: 500 }
        )
      }
    },
    { type: 'mutation' }
  )
}
