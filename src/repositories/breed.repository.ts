/**
 * Breed Repository - Prisma Implementation
 */

import { prisma } from '@/lib/prisma'
import type { Prisma } from '@/generated/prisma'
import type { IBreedRepository, BreedWithAnimals } from './types'

export class BreedRepository implements IBreedRepository {
  async findById(id: number): Promise<BreedWithAnimals | null> {
    return prisma.breed.findUnique({
      where: { breedID: id },
      include: { animal: true },
    })
  }

  async findByName(
    name: string
  ): Promise<Prisma.breedGetPayload<object> | null> {
    return prisma.breed.findFirst({
      where: { breedname: name },
    })
  }

  async findAll(): Promise<Prisma.breedGetPayload<object>[]> {
    return prisma.breed.findMany({
      orderBy: { breedname: 'asc' },
    })
  }

  async create(
    data: Prisma.breedCreateInput
  ): Promise<Prisma.breedGetPayload<object>> {
    return prisma.breed.create({ data })
  }

  async update(
    id: number,
    data: Prisma.breedUpdateInput
  ): Promise<Prisma.breedGetPayload<object>> {
    return prisma.breed.update({
      where: { breedID: id },
      data,
    })
  }

  async delete(id: number): Promise<void> {
    await prisma.breed.delete({
      where: { breedID: id },
    })
  }

  async countAnimals(breedId: number): Promise<number> {
    return prisma.animal.count({
      where: { breedID: breedId },
    })
  }
}

// Export singleton instance
export const breedRepository = new BreedRepository()
