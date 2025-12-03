/**
 * Animals Service - Business logic for animal operations
 */
import type { Prisma } from '@/generated/prisma'

type AnimalWithRelations = Prisma.animalGetPayload<{
  include: { customer: true; breed: true }
}>

/**
 * Normalize phone number by removing spaces, dashes, parentheses
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-\(\)]/g, '')
}

/**
 * Simple fuzzy matching using character overlap
 * Returns true if 70% or more characters match
 */
function isSimilar(str1: string, str2: string): boolean {
  const minLength = Math.min(str1.length, str2.length)
  if (minLength < 3) return false

  let matches = 0
  for (let i = 0; i < minLength; i++) {
    if (str1[i] === str2[i]) matches++
  }
  return matches / minLength >= 0.7
}

/**
 * Check a field against a search term and return score with reason
 */
function checkField(
  value: string | null | undefined,
  searchTerm: string,
  fieldName: string,
  isPhoneField: boolean = false
): { score: number; reason: string } {
  if (!value) return { score: 0, reason: `${fieldName}: null/empty` }

  let compareValue = value.toLowerCase()
  let compareTerm = searchTerm.toLowerCase()

  if (isPhoneField) {
    compareValue = normalizePhone(value)
    compareTerm = normalizePhone(searchTerm)
  }

  if (compareValue === compareTerm)
    return { score: 100, reason: `${fieldName}: EXACT match` }
  if (compareValue.startsWith(compareTerm))
    return { score: 80, reason: `${fieldName}: STARTS WITH` }
  if (compareValue.includes(compareTerm))
    return { score: 50, reason: `${fieldName}: CONTAINS` }
  if (isSimilar(compareValue, compareTerm))
    return { score: 30, reason: `${fieldName}: FUZZY match` }

  return { score: 0, reason: `${fieldName}: no match` }
}

/**
 * Calculate relevance score for an animal against a search query
 */
export function calculateRelevanceScore(
  animal: AnimalWithRelations,
  query: string
): { score: number; breakdown: Record<string, unknown> } {
  const lowerQuery = query.toLowerCase().trim()
  const searchTerms = lowerQuery.split(/\s+/)
  const breakdown: Record<string, unknown> = {
    query,
    searchTerms,
  }

  // Single-word query - check all fields, return max score
  if (searchTerms.length === 1) {
    const checks = [
      checkField(animal.customer.surname, lowerQuery, 'surname'),
      checkField(animal.customer.firstname, lowerQuery, 'firstname'),
      checkField(animal.customer.phone1, lowerQuery, 'phone1', true),
      checkField(animal.customer.phone2, lowerQuery, 'phone2', true),
      checkField(animal.customer.phone3, lowerQuery, 'phone3', true),
      checkField(animal.customer.email, lowerQuery, 'email'),
      checkField(animal.animalname, lowerQuery, 'animalname'),
      checkField(animal.breed.breedname, lowerQuery, 'breedname'),
    ]

    const bestMatch = checks.reduce((best, current) =>
      current.score > best.score ? current : best
    )

    breakdown.singleWordMode = true
    breakdown.bestMatch = bestMatch
    breakdown.finalScore = bestMatch.score

    return { score: bestMatch.score, breakdown }
  }

  // Multi-word query - score each term and combine
  let totalScore = 0
  const termScores: Record<string, unknown>[] = []

  for (const term of searchTerms) {
    const checks = [
      checkField(animal.customer.surname, term, 'surname'),
      checkField(animal.customer.firstname, term, 'firstname'),
      checkField(animal.customer.phone1, term, 'phone1', true),
      checkField(animal.customer.phone2, term, 'phone2', true),
      checkField(animal.customer.phone3, term, 'phone3', true),
      checkField(animal.customer.email, term, 'email'),
      checkField(animal.animalname, term, 'animalname'),
      checkField(animal.breed.breedname, term, 'breedname'),
    ]

    const bestMatch = checks.reduce((best, current) =>
      current.score > best.score ? current : best
    )

    termScores.push({ term, bestMatch })
    totalScore += bestMatch.score
  }

  // Diversity bonus for matching multiple different fields
  const matchedFields = new Set(
    termScores
      .filter(ts => (ts.bestMatch as { score: number }).score > 0)
      .map(ts => (ts.bestMatch as { reason: string }).reason.split(':')[0])
  )

  if (matchedFields.size > 1) {
    const diversityBonus = matchedFields.size * 10
    totalScore += diversityBonus
    breakdown.diversityBonus = diversityBonus
    breakdown.matchedFields = Array.from(matchedFields)
  }

  breakdown.multiWordMode = true
  breakdown.termScores = termScores
  breakdown.finalScore = totalScore

  return { score: totalScore, breakdown }
}

/**
 * Sort animals by relevance score
 */
export function sortByRelevance<T extends AnimalWithRelations>(
  animals: T[],
  query: string
): T[] {
  return animals
    .map(animal => ({
      animal,
      ...calculateRelevanceScore(animal, query),
    }))
    .sort((a, b) => b.score - a.score)
    .map(item => item.animal)
}
