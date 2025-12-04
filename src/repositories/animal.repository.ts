/**
 * Animal Repository - Prisma Implementation
 */

import { prisma } from '@/lib/prisma'
import type { Prisma } from '@/generated/prisma'
import type {
  IAnimalRepository,
  AnimalWithRelations,
  AnimalWithNotes,
  SearchOptions,
} from './types'
import { normalizePhone } from '@/services/animals.service'

export class AnimalRepository implements IAnimalRepository {
  async findById(id: number): Promise<AnimalWithNotes | null> {
    return prisma.animal.findUnique({
      where: { animalID: id },
      include: { customer: true, breed: true, notes: true },
    })
  }

  async findMany(options: SearchOptions): Promise<{
    animals: AnimalWithRelations[]
    total: number
  }> {
    const { query } = options

    // Build search conditions
    const where = this.buildSearchConditions(query)

    const [animals, total] = await Promise.all([
      prisma.animal.findMany({
        where,
        include: { customer: true, breed: true },
      }),
      prisma.animal.count({ where }),
    ])

    return { animals, total }
  }

  async create(data: Prisma.animalCreateInput): Promise<AnimalWithRelations> {
    return prisma.animal.create({
      data,
      include: { customer: true, breed: true },
    })
  }

  async update(
    id: number,
    data: Prisma.animalUpdateInput
  ): Promise<AnimalWithRelations> {
    return prisma.animal.update({
      where: { animalID: id },
      data,
      include: { customer: true, breed: true },
    })
  }

  async delete(id: number): Promise<void> {
    await prisma.animal.delete({
      where: { animalID: id },
    })
  }

  async countByCustomer(customerId: number): Promise<number> {
    return prisma.animal.count({
      where: { customerID: customerId },
    })
  }

  private buildSearchConditions(query: string): Prisma.animalWhereInput {
    const searchTerms = query.split(/\s+/)
    const isPhoneQuery = /^\d[\d\s\-\(\)]*\d$/.test(query) && query.length >= 4
    const normalizedQuery = normalizePhone(query)

    const orConditions: Prisma.animalWhereInput[] = []

    // Text field searches (unless phone query)
    if (!isPhoneQuery) {
      orConditions.push(
        { customer: { surname: { contains: query } } },
        { customer: { firstname: { contains: query } } },
        { customer: { email: { contains: query } } },
        { animalname: { contains: query } },
        { breed: { breedname: { contains: query } } }
      )
    }

    // Phone field searches
    if (isPhoneQuery) {
      orConditions.push(
        { customer: { phone1: { contains: normalizedQuery } } },
        { customer: { phone2: { contains: normalizedQuery } } },
        { customer: { phone3: { contains: normalizedQuery } } }
      )
    }

    // Multi-term searches
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

    return { OR: orConditions }
  }
}

// Export singleton instance
export const animalRepository = new AnimalRepository()
