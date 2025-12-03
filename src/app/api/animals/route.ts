// src/app/api/animals/route.ts - Search & List
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  searchAnimalsSchema,
  createAnimalSchema,
} from '@/lib/validations/animal'
import type { Prisma } from '@/generated/prisma'
import { log } from '@/lib/logger'
import { withRateLimit } from '@/lib/middleware/rateLimit'

// Helper function to calculate relevance score with detailed breakdown
function calculateRelevanceScore(
  animal: Prisma.animalGetPayload<{
    include: { customer: true; breed: true }
  }>,
  query: string
): { score: number; breakdown: Record<string, unknown> } {
  const lowerQuery = query.toLowerCase().trim()
  const searchTerms = lowerQuery.split(/\s+/)
  const breakdown: Record<string, unknown> = {
    query: query,
    searchTerms: searchTerms,
  }

  // Simple fuzzy matching using character overlap
  const isSimilar = (str1: string, str2: string): boolean => {
    const minLength = Math.min(str1.length, str2.length)
    if (minLength < 3) return false

    let matches = 0
    for (let i = 0; i < minLength; i++) {
      if (str1[i] === str2[i]) matches++
    }
    // Consider similar if 70% or more characters match
    return matches / minLength >= 0.7
  }

  const checkField = (
    value: string | null | undefined,
    searchTerm: string,
    fieldName: string,
    isPhoneField: boolean = false
  ): { score: number; reason: string } => {
    if (!value) return { score: 0, reason: `${fieldName}: null/empty` }

    // For phone fields, normalize both values before comparison
    let compareValue = value.toLowerCase()
    let compareTerm = searchTerm.toLowerCase()

    if (isPhoneField) {
      compareValue = normalizePhone(value)
      compareTerm = normalizePhone(searchTerm)
    }

    if (compareValue === compareTerm)
      return {
        score: 100,
        reason: `${fieldName}: "${value}" EXACT match "${searchTerm}"`,
      }
    if (compareValue.startsWith(compareTerm))
      return {
        score: 80,
        reason: `${fieldName}: "${value}" STARTS WITH "${searchTerm}"`,
      }
    if (compareValue.includes(compareTerm))
      return {
        score: 50,
        reason: `${fieldName}: "${value}" CONTAINS "${searchTerm}"`,
      }

    // Check for fuzzy match (simple similarity check)
    if (isSimilar(compareValue, compareTerm))
      return {
        score: 30,
        reason: `${fieldName}: "${value}" FUZZY match "${searchTerm}"`,
      }

    return { score: 0, reason: `${fieldName}: "${value}" no match` }
  }

  // For single-word queries, check all fields and return maximum score
  if (searchTerms.length === 1) {
    const checks = [
      checkField(animal.customer.surname, lowerQuery, 'surname', false),
      checkField(animal.customer.firstname, lowerQuery, 'firstname', false),
      checkField(animal.customer.phone1, lowerQuery, 'phone1', true),
      checkField(animal.customer.phone2, lowerQuery, 'phone2', true),
      checkField(animal.customer.phone3, lowerQuery, 'phone3', true),
      checkField(animal.customer.email, lowerQuery, 'email', false),
      checkField(animal.animalname, lowerQuery, 'animalname', false),
      checkField(animal.breed.breedname, lowerQuery, 'breedname', false),
    ]

    const bestMatch = checks.reduce((best, current) =>
      current.score > best.score ? current : best
    )

    breakdown.singleWordMode = true
    breakdown.allChecks = checks
    breakdown.bestMatch = bestMatch

    return { score: bestMatch.score, breakdown }
  }

  // For multi-word queries, score each term individually and sum them
  let totalScore = 0
  const matchedFieldTypes = new Set<string>()
  const termBreakdowns: Record<string, unknown>[] = []

  for (const term of searchTerms) {
    const termDetail: Record<string, unknown> = { term }

    // Check all fields for this term
    const customerNameChecks = [
      checkField(animal.customer.surname, term, 'surname', false),
      checkField(animal.customer.firstname, term, 'firstname', false),
    ]
    const customerNameScore = Math.max(...customerNameChecks.map(c => c.score))
    const customerNameBest = customerNameChecks.find(
      c => c.score === customerNameScore
    )

    const customerContactChecks = [
      checkField(animal.customer.phone1, term, 'phone1', true),
      checkField(animal.customer.phone2, term, 'phone2', true),
      checkField(animal.customer.phone3, term, 'phone3', true),
      checkField(animal.customer.email, term, 'email', false),
    ]
    const customerContactScore = Math.max(
      ...customerContactChecks.map(c => c.score)
    )
    const customerContactBest = customerContactChecks.find(
      c => c.score === customerContactScore
    )

    const animalNameCheck = checkField(
      animal.animalname,
      term,
      'animalname',
      false
    )
    const animalNameScore = animalNameCheck.score

    const breedCheck = checkField(
      animal.breed.breedname,
      term,
      'breedname',
      false
    )
    const breedScore = breedCheck.score

    // Take the best score for this term
    const termBestScore = Math.max(
      customerNameScore,
      customerContactScore,
      animalNameScore,
      breedScore
    )

    termDetail.customerName = {
      score: customerNameScore,
      best: customerNameBest,
      all: customerNameChecks,
    }
    termDetail.customerContact = {
      score: customerContactScore,
      best: customerContactBest,
      all: customerContactChecks,
    }
    termDetail.animalName = { score: animalNameScore, check: animalNameCheck }
    termDetail.breed = { score: breedScore, check: breedCheck }
    termDetail.bestScore = termBestScore

    // Track which field type matched for diversity bonus
    if (customerNameScore > 0) matchedFieldTypes.add('customer')
    if (customerContactScore > 0) matchedFieldTypes.add('contact')
    if (animalNameScore > 0) matchedFieldTypes.add('animal')
    if (breedScore > 0) matchedFieldTypes.add('breed')

    totalScore += termBestScore
    termBreakdowns.push(termDetail)
  }

  // Apply diversity bonus: if terms match different field types, add bonus
  const diversityBonus =
    matchedFieldTypes.size > 1 ? 25 * (matchedFieldTypes.size - 1) : 0
  totalScore += diversityBonus

  breakdown.multiWordMode = true
  breakdown.terms = termBreakdowns
  breakdown.subtotal = totalScore - diversityBonus
  breakdown.matchedCategories = Array.from(matchedFieldTypes)
  breakdown.diversityBonus = diversityBonus
  breakdown.finalScore = totalScore

  return { score: totalScore, breakdown }
}

// Helper function to normalize phone numbers for searching
function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-\(\)]/g, '')
}

// GET /api/animals?q=john+smith&page=1
export async function GET(request: NextRequest) {
  return withRateLimit(
    request,
    async () => {
      const { searchParams } = new URL(request.url)

      // Validate query parameters with Zod
      const validationResult = searchAnimalsSchema.safeParse({
        q: searchParams.get('q') || '',
        page: parseInt(searchParams.get('page') || '1'),
        limit: parseInt(searchParams.get('limit') || '20'),
        sort: searchParams.get('sort') || undefined,
        order: searchParams.get('order') || undefined,
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

      const { q: rawQuery, page, limit, sort, order } = validationResult.data

      // Trim whitespace from query to handle accidental leading/trailing spaces
      const query = rawQuery.trim()

      // If no query, return empty results
      if (!query) {
        return NextResponse.json({
          animals: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        })
      }

      // Split query into terms for multi-word search
      const searchTerms = query.split(/\s+/)

      // Check if query looks like a phone number (mostly digits)
      const isPhoneQuery =
        /^\d[\d\s\-\(\)]*\d$/.test(query) && query.length >= 4
      const normalizedQuery = normalizePhone(query)

      // Build comprehensive OR conditions for unified search
      // Note: MySQL is case-insensitive by default, no need for mode option
      const orConditions: Prisma.animalWhereInput[] = []

      // Always search text fields (unless it's purely a phone number)
      if (!isPhoneQuery) {
        orConditions.push(
          { customer: { surname: { contains: query } } },
          { customer: { firstname: { contains: query } } },
          { customer: { email: { contains: query } } },
          { animalname: { contains: query } },
          { breed: { breedname: { contains: query } } }
        )
      }

      // For phone number searches: DB has no formatting, just digits
      // So normalize the query and search directly
      if (isPhoneQuery) {
        // Search phone fields with normalized query
        // Note: Using raw SQL pattern with % wildcards to ensure proper LIKE matching
        orConditions.push(
          { customer: { phone1: { contains: normalizedQuery } } },
          { customer: { phone2: { contains: normalizedQuery } } },
          { customer: { phone3: { contains: normalizedQuery } } }
        )

        log.debug('Phone search', {
          normalizedQuery,
          pattern: `%${normalizedQuery}%`,
        })
      }

      // Debug logging (only in development with DEBUG=true)
      log.debug('Animal search initiated', {
        query,
        isPhoneQuery,
        normalizedQuery,
        orConditionCount: orConditions.length,
      })

      // For multi-term queries, also search individual terms
      if (searchTerms.length > 1) {
        searchTerms.forEach(term => {
          orConditions.push(
            { animalname: { contains: term } },
            { breed: { breedname: { contains: term } } },
            { customer: { surname: { contains: term } } },
            { customer: { firstname: { contains: term } } }
          )
        })
      }

      const where: Prisma.animalWhereInput = {
        OR: orConditions,
      }

      // Fetch all matching records (without pagination initially, for scoring)
      const [allAnimals, total] = await Promise.all([
        prisma.animal.findMany({
          where,
          include: { customer: true, breed: true },
        }),
        prisma.animal.count({ where }),
      ])

      // Debug logging (data is automatically redacted by pino)
      log.debug('Animal search results', {
        recordsFound: total,
        hasResults: total > 0,
      })

      // Calculate relevance scores and sort by score
      type ScoredAnimal = {
        animal: Prisma.animalGetPayload<{
          include: { customer: true; breed: true }
        }>
        score: number
        breakdown: Record<string, unknown>
      }

      const scoredAnimals = allAnimals
        .map(
          (
            animal: Prisma.animalGetPayload<{
              include: { customer: true; breed: true }
            }>
          ): ScoredAnimal => {
            const result = calculateRelevanceScore(animal, query)
            return {
              animal,
              score: result.score,
              breakdown: result.breakdown,
            }
          }
        )
        .sort((a: ScoredAnimal, b: ScoredAnimal) => {
          let comparison = 0

          switch (sort) {
            case 'customer':
              comparison = (a.animal.customer.surname || '').localeCompare(
                b.animal.customer.surname || ''
              )
              // If surnames are equal, sort by firstname
              if (comparison === 0) {
                comparison = (a.animal.customer.firstname || '').localeCompare(
                  b.animal.customer.firstname || ''
                )
              }
              break
            case 'animal':
              comparison = (a.animal.animalname || '').localeCompare(
                b.animal.animalname || ''
              )
              break
            case 'lastVisit':
              const dateA = a.animal.lastvisit
                ? new Date(a.animal.lastvisit).getTime()
                : 0
              const dateB = b.animal.lastvisit
                ? new Date(b.animal.lastvisit).getTime()
                : 0
              comparison = dateA - dateB
              break
            case 'relevance':
            default:
              // Relevance is score based.
              // Default sort order for relevance is DESC (highest score first)
              // So we calculate comparison as (a - b), then if order is desc (default) it becomes -(a-b) = b-a
              comparison = a.score - b.score
              // If scores are equal, fallback to customer surname ascending
              if (comparison === 0) {
                // Force surname to be ascending regardless of overall order for relevance tie-breaker
                // Or respect the order? Usually tie-breakers are fixed.
                // Let's respect order for now, or just stick to the previous logic for relevance
                if (order === 'desc') {
                  return (a.animal.customer.surname || '').localeCompare(
                    b.animal.customer.surname || ''
                  )
                } else {
                  return (b.animal.customer.surname || '').localeCompare(
                    a.animal.customer.surname || ''
                  )
                }
              }
              break
          }

          return order === 'desc' ? -comparison : comparison
        })

      // Apply pagination after scoring
      const paginatedAnimals = scoredAnimals.slice(
        (page - 1) * limit,
        page * limit
      )

      // Transform database fields to API interface
      const transformedAnimals = paginatedAnimals.map(
        ({ animal, score, breakdown }: ScoredAnimal) => ({
          id: animal.animalID,
          name: animal.animalname,
          breed: animal.breed.breedname,
          colour: animal.colour,
          sex: animal.SEX,
          cost: animal.cost,
          lastVisit: animal.lastvisit,
          thisVisit: animal.thisvisit,
          comments: animal.comments,
          relevanceScore: score, // Include the relevance score
          scoreBreakdown: breakdown, // Include detailed scoring breakdown
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
        })
      )

      return NextResponse.json({
        animals: transformedAnimals,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      })
    },
    { type: 'search' }
  )
}

// POST /api/animals - Create new animal
export async function POST(request: NextRequest) {
  return withRateLimit(
    request,
    async () => {
      const body = await request.json()

      // Validate request body with Zod
      const validationResult = createAnimalSchema.safeParse(body)

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

      // Look up the breed by name to get breedID
      const breed = await prisma.breed.findFirst({
        where: { breedname: data.breed },
      })

      if (!breed) {
        return NextResponse.json(
          {
            error: 'Invalid breed',
            details: [
              {
                path: ['breed'],
                message: `Breed "${data.breed}" not found. Please select a valid breed.`,
              },
            ],
          },
          { status: 400 }
        )
      }

      const animal = await prisma.animal.create({
        data: {
          customerID: data.customerId,
          animalname: data.name,
          breedID: breed.breedID,
          SEX: data.sex === 'Male' ? 'Male' : 'Female',
          colour: data.colour || null,
          cost: data.cost || 0,
          lastvisit: data.lastVisit
            ? new Date(data.lastVisit)
            : new Date('1900-01-01'),
          thisvisit: data.thisVisit
            ? new Date(data.thisVisit)
            : new Date('1900-01-01'),
          comments: data.comments || null,
        },
        include: { customer: true, breed: true },
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
      }

      return NextResponse.json(transformedAnimal, { status: 201 })
    },
    { type: 'mutation' }
  )
}
