// src/app/api/customers/history/route.ts - Inactive customers by months with pagination
// Returns one row per CUSTOMER with array of inactive animals
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function normalizePhone(input: string | null | undefined): string {
  if (!input) return ''
  return input.replace(/[\s\-\(\)]+/g, '')
}

interface InactiveAnimal {
  animalId: number
  name: string
  breed: string
  lastVisit: string | null
  monthsSince: number | null
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const monthsParam = searchParams.get('months')
  const q = (searchParams.get('q') || '').trim()
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(
    100,
    Math.max(10, parseInt(searchParams.get('limit') || '25', 10))
  )

  const months = monthsParam ? parseInt(monthsParam, 10) : 12
  const allowed = new Set([12, 24, 36])
  const periodMonths = allowed.has(months) ? months : 12

  const now = new Date()
  const cutoffDate = new Date(now)
  cutoffDate.setMonth(cutoffDate.getMonth() - periodMonths)

  // Fetch all customers with their animals
  const customers = await prisma.customer.findMany({
    include: {
      animal: {
        include: {
          breed: {
            select: {
              breedname: true,
            },
          },
        },
      },
    },
  })

  const qLower = q.toLowerCase()
  const qDigits = normalizePhone(q)

  // Process each customer: find their inactive animals
  const results: Array<{
    customerId: number
    name: string
    address: string
    phone: string
    email: string | null
    animals: InactiveAnimal[]
    oldestVisit: string | null
    _surname: string | null
  }> = []

  for (const customer of customers) {
    // Find all animals for this customer that haven't visited since cutoff
    const inactiveAnimals: InactiveAnimal[] = []

    for (const animal of customer.animal) {
      const lastVisitDate = animal.thisvisit

      // Check if this animal's last visit is before the cutoff
      if (lastVisitDate && lastVisitDate < cutoffDate) {
        const monthsSince =
          (now.getTime() - new Date(lastVisitDate).getTime()) /
          (1000 * 60 * 60 * 24 * 30.4375)

        inactiveAnimals.push({
          animalId: animal.animalID,
          name: animal.animalname,
          breed: animal.breed.breedname,
          lastVisit: lastVisitDate.toISOString().split('T')[0],
          monthsSince: Math.floor(monthsSince),
        })
      } else if (!lastVisitDate) {
        // Animal has never visited - include it
        inactiveAnimals.push({
          animalId: animal.animalID,
          name: animal.animalname,
          breed: animal.breed.breedname,
          lastVisit: null,
          monthsSince: null,
        })
      }
    }

    // Only include customer if they have at least one inactive animal
    if (inactiveAnimals.length === 0) continue

    // Sort animals by name
    inactiveAnimals.sort((a, b) => a.name.localeCompare(b.name))

    // Find oldest visit among inactive animals
    const oldestVisit = inactiveAnimals
      .filter(a => a.lastVisit)
      .reduce<string | null>((oldest, a) => {
        if (!a.lastVisit) return oldest
        if (!oldest || a.lastVisit < oldest) return a.lastVisit
        return oldest
      }, null)

    // Build full address
    const addressParts = [customer.address, customer.suburb]
    if (customer.postcode) {
      addressParts.push(String(customer.postcode))
    }
    const fullAddress = addressParts.filter(Boolean).join(', ')

    // Build full name
    const fullName = [customer.firstname, customer.surname]
      .filter(Boolean)
      .join(' ')

    results.push({
      customerId: customer.customerID,
      name: fullName,
      address: fullAddress,
      phone: customer.phone1 || customer.phone2 || customer.phone3 || '',
      email: customer.email,
      animals: inactiveAnimals,
      oldestVisit,
      _surname: customer.surname,
    })
  }

  // Apply search filter if provided
  let filtered = results
  if (qLower) {
    filtered = results.filter(r => {
      const matchText =
        (r.name || '').toLowerCase().includes(qLower) ||
        (r.address || '').toLowerCase().includes(qLower) ||
        (r.email || '').toLowerCase().includes(qLower) ||
        r.animals.some(
          a =>
            a.name.toLowerCase().includes(qLower) ||
            a.breed.toLowerCase().includes(qLower)
        )
      const matchPhone =
        qDigits.length > 0 && normalizePhone(r.phone).includes(qDigits)
      return matchText || matchPhone
    })
  }

  // Calculate total before pagination
  const total = filtered.length

  // Find oldest visit across all customers
  const globalOldestVisit = filtered
    .filter(r => r.oldestVisit)
    .reduce<string | null>((oldest, r) => {
      if (!r.oldestVisit) return oldest
      if (!oldest || r.oldestVisit < oldest) return r.oldestVisit
      return oldest
    }, null)

  // Count total inactive animals
  const totalAnimals = filtered.reduce((sum, r) => sum + r.animals.length, 0)

  // Sort by surname asc
  filtered.sort((a, b) => {
    const surnameA = (a._surname || '').toLowerCase()
    const surnameB = (b._surname || '').toLowerCase()
    return surnameA.localeCompare(surnameB)
  })

  // Apply pagination
  const totalPages = Math.ceil(total / limit)
  const offset = (page - 1) * limit
  const paginatedResults = filtered.slice(offset, offset + limit)

  // Shape response
  return NextResponse.json({
    months: periodMonths,
    q,
    total,
    totalAnimals,
    totalPages,
    page,
    limit,
    oldestVisit: globalOldestVisit,
    customers: paginatedResults.map(r => ({
      customerId: r.customerId,
      name: r.name,
      address: r.address,
      phone: r.phone,
      animals: r.animals,
      oldestVisit: r.oldestVisit,
    })),
  })
}
