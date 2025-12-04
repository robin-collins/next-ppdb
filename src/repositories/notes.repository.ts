/**
 * Notes Repository - Prisma Implementation
 */

import { prisma } from '@/lib/prisma'
import type { Prisma } from '@/generated/prisma'
import type { INotesRepository, NoteWithAnimal } from './types'

export class NotesRepository implements INotesRepository {
  async findById(id: number): Promise<NoteWithAnimal | null> {
    return prisma.notes.findUnique({
      where: { noteID: id },
      include: { animal: true },
    })
  }

  async findByAnimalId(
    animalId: number
  ): Promise<Prisma.notesGetPayload<object>[]> {
    return prisma.notes.findMany({
      where: { animalID: animalId },
      orderBy: { date: 'desc' },
    })
  }

  async create(
    data: Prisma.notesCreateInput
  ): Promise<Prisma.notesGetPayload<object>> {
    return prisma.notes.create({ data })
  }

  async update(
    id: number,
    data: Prisma.notesUpdateInput
  ): Promise<Prisma.notesGetPayload<object>> {
    return prisma.notes.update({
      where: { noteID: id },
      data,
    })
  }

  async delete(id: number): Promise<void> {
    await prisma.notes.delete({
      where: { noteID: id },
    })
  }

  async deleteByAnimalId(animalId: number): Promise<number> {
    const result = await prisma.notes.deleteMany({
      where: { animalID: animalId },
    })
    return result.count
  }

  async countByAnimalId(animalId: number): Promise<number> {
    return prisma.notes.count({
      where: { animalID: animalId },
    })
  }
}

// Export singleton instance
export const notesRepository = new NotesRepository()
