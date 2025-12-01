// src/lib/import/importer.ts
// Prisma batch import with validation and progress tracking

import { PrismaClient } from '@/generated/prisma'
import { prisma } from '@/lib/prisma'
import {
  validateBreed,
  validateCustomer,
  validateAnimal,
  validateNote,
} from './validator'
import { LogEntry, createLog } from './remediation'

const BATCH_SIZE = 100

export interface ImportStats {
  totalRecords: number
  processedRecords: number
  validRecords: number
  repairedRecords: number
  skippedRecords: number
}

export interface ImportProgress {
  phase: string
  currentTable: string
  stats: ImportStats
  logs: LogEntry[]
}

export type ProgressCallback = (progress: ImportProgress) => void

// ============================================
// ID MAPPINGS
// ============================================

export interface IdMappings {
  breeds: Map<number, number>
  customers: Map<number, number>
  animals: Map<number, number>
}

// ============================================
// BREED IMPORT
// ============================================

export async function importBreeds(
  tempPrisma: PrismaClient,
  onProgress?: ProgressCallback
): Promise<{ stats: ImportStats; idMap: Map<number, number> }> {
  const stats: ImportStats = {
    totalRecords: 0,
    processedRecords: 0,
    validRecords: 0,
    repairedRecords: 0,
    skippedRecords: 0,
  }
  const idMap = new Map<number, number>()
  const existingNames = new Set<string>()
  const allLogs: LogEntry[] = []

  // Get total count
  stats.totalRecords = await tempPrisma.breed.count()

  allLogs.push(
    createLog('info', `Starting breed import (${stats.totalRecords} records)`, {
      table: 'breed',
    })
  )

  // Process in batches
  for (let offset = 0; offset < stats.totalRecords; offset += BATCH_SIZE) {
    const batch = await tempPrisma.breed.findMany({
      skip: offset,
      take: BATCH_SIZE,
      orderBy: { breedID: 'asc' },
    })

    for (const raw of batch) {
      const result = validateBreed(
        raw as unknown as Record<string, unknown>,
        existingNames
      )
      allLogs.push(...result.logs)

      if (result.skip || !result.data) {
        stats.skippedRecords++
        stats.processedRecords++
        continue
      }

      try {
        // Insert into production DB
        const inserted = await prisma.breed.create({
          data: {
            breedname: result.data.breedname,
            avgtime: result.data.avgtime,
            avgcost: result.data.avgcost,
          },
        })

        // Map old ID to new ID
        idMap.set(raw.breedID, inserted.breedID)
        existingNames.add(result.data.breedname.toLowerCase())

        stats.validRecords++
        if (result.repairs.length > 0) {
          stats.repairedRecords++
        }

        allLogs.push(
          createLog('success', `Imported breed: ${result.data.breedname}`, {
            table: 'breed',
            recordId: inserted.breedID,
          })
        )
      } catch (error) {
        stats.skippedRecords++
        allLogs.push(
          createLog(
            'error',
            `Failed to import breed: ${error instanceof Error ? error.message : 'Unknown'}`,
            {
              table: 'breed',
              recordId: raw.breedID,
            }
          )
        )
      }

      stats.processedRecords++
    }

    onProgress?.({
      phase: 'importing',
      currentTable: 'breed',
      stats: { ...stats },
      logs: allLogs.slice(-10), // Send last 10 logs
    })
  }

  return { stats, idMap }
}

// ============================================
// CUSTOMER IMPORT
// ============================================

export async function importCustomers(
  tempPrisma: PrismaClient,
  onProgress?: ProgressCallback
): Promise<{ stats: ImportStats; idMap: Map<number, number> }> {
  const stats: ImportStats = {
    totalRecords: 0,
    processedRecords: 0,
    validRecords: 0,
    repairedRecords: 0,
    skippedRecords: 0,
  }
  const idMap = new Map<number, number>()
  const allLogs: LogEntry[] = []

  stats.totalRecords = await tempPrisma.customer.count()

  allLogs.push(
    createLog(
      'info',
      `Starting customer import (${stats.totalRecords} records)`,
      { table: 'customer' }
    )
  )

  for (let offset = 0; offset < stats.totalRecords; offset += BATCH_SIZE) {
    const batch = await tempPrisma.customer.findMany({
      skip: offset,
      take: BATCH_SIZE,
      orderBy: { customerID: 'asc' },
    })

    for (const raw of batch) {
      const result = validateCustomer(raw as unknown as Record<string, unknown>)
      allLogs.push(...result.logs)

      if (result.skip || !result.data) {
        stats.skippedRecords++
        stats.processedRecords++
        continue
      }

      try {
        const inserted = await prisma.customer.create({
          data: {
            surname: result.data.surname,
            firstname: result.data.firstname,
            address: result.data.address,
            suburb: result.data.suburb,
            postcode: result.data.postcode,
            phone1: result.data.phone1,
            phone2: result.data.phone2,
            phone3: result.data.phone3,
            email: result.data.email,
          },
        })

        idMap.set(raw.customerID, inserted.customerID)
        stats.validRecords++
        if (result.repairs.length > 0) {
          stats.repairedRecords++
        }
      } catch (error) {
        stats.skippedRecords++
        allLogs.push(
          createLog(
            'error',
            `Failed to import customer: ${error instanceof Error ? error.message : 'Unknown'}`,
            {
              table: 'customer',
              recordId: raw.customerID,
            }
          )
        )
      }

      stats.processedRecords++
    }

    onProgress?.({
      phase: 'importing',
      currentTable: 'customer',
      stats: { ...stats },
      logs: allLogs.slice(-10),
    })
  }

  return { stats, idMap }
}

// ============================================
// ANIMAL IMPORT
// ============================================

export async function importAnimals(
  tempPrisma: PrismaClient,
  breedIdMap: Map<number, number>,
  customerIdMap: Map<number, number>,
  onProgress?: ProgressCallback
): Promise<{ stats: ImportStats; idMap: Map<number, number> }> {
  const stats: ImportStats = {
    totalRecords: 0,
    processedRecords: 0,
    validRecords: 0,
    repairedRecords: 0,
    skippedRecords: 0,
  }
  const idMap = new Map<number, number>()
  const allLogs: LogEntry[] = []

  // Create valid ID sets for lookup
  const validBreedIds = new Set(breedIdMap.values())

  // Get or create Unknown breed
  let unknownBreed = await prisma.breed.findFirst({
    where: { breedname: 'Unknown' },
  })
  if (!unknownBreed) {
    unknownBreed = await prisma.breed.create({
      data: { breedname: 'Unknown', avgtime: null, avgcost: 0 },
    })
  }
  const unknownBreedId = unknownBreed.breedID

  stats.totalRecords = await tempPrisma.animal.count()

  allLogs.push(
    createLog(
      'info',
      `Starting animal import (${stats.totalRecords} records)`,
      { table: 'animal' }
    )
  )

  for (let offset = 0; offset < stats.totalRecords; offset += BATCH_SIZE) {
    const batch = await tempPrisma.animal.findMany({
      skip: offset,
      take: BATCH_SIZE,
      orderBy: { animalID: 'asc' },
    })

    for (const raw of batch) {
      // Map old IDs to new IDs
      const mappedCustomerId = customerIdMap.get(raw.customerID)
      const mappedBreedId = breedIdMap.get(raw.breedID) ?? unknownBreedId

      const result = validateAnimal(
        {
          ...raw,
          customerID: mappedCustomerId,
          breedID: mappedBreedId,
        } as unknown as Record<string, unknown>,
        new Set(customerIdMap.values()),
        validBreedIds,
        unknownBreedId
      )
      allLogs.push(...result.logs)

      if (result.skip || !result.data || mappedCustomerId === undefined) {
        stats.skippedRecords++
        stats.processedRecords++
        if (mappedCustomerId === undefined) {
          allLogs.push(
            createLog(
              'warning',
              `Orphan animal skipped: original customerID ${raw.customerID} not imported`,
              {
                table: 'animal',
                recordId: raw.animalID,
              }
            )
          )
        }
        continue
      }

      try {
        const inserted = await prisma.animal.create({
          data: {
            animalname: result.data.animalname,
            breedID: mappedBreedId,
            customerID: mappedCustomerId,
            SEX: result.data.SEX,
            colour: result.data.colour,
            cost: result.data.cost,
            lastvisit: result.data.lastvisit,
            thisvisit: result.data.thisvisit,
            comments: result.data.comments,
          },
        })

        idMap.set(raw.animalID, inserted.animalID)
        stats.validRecords++
        if (result.repairs.length > 0) {
          stats.repairedRecords++
        }
      } catch (error) {
        stats.skippedRecords++
        allLogs.push(
          createLog(
            'error',
            `Failed to import animal: ${error instanceof Error ? error.message : 'Unknown'}`,
            {
              table: 'animal',
              recordId: raw.animalID,
            }
          )
        )
      }

      stats.processedRecords++
    }

    onProgress?.({
      phase: 'importing',
      currentTable: 'animal',
      stats: { ...stats },
      logs: allLogs.slice(-10),
    })
  }

  return { stats, idMap }
}

// ============================================
// NOTES IMPORT
// ============================================

export async function importNotes(
  tempPrisma: PrismaClient,
  animalIdMap: Map<number, number>,
  onProgress?: ProgressCallback
): Promise<{ stats: ImportStats }> {
  const stats: ImportStats = {
    totalRecords: 0,
    processedRecords: 0,
    validRecords: 0,
    repairedRecords: 0,
    skippedRecords: 0,
  }
  const allLogs: LogEntry[] = []

  const validAnimalIds = new Set(animalIdMap.values())

  stats.totalRecords = await tempPrisma.notes.count()

  allLogs.push(
    createLog('info', `Starting notes import (${stats.totalRecords} records)`, {
      table: 'notes',
    })
  )

  for (let offset = 0; offset < stats.totalRecords; offset += BATCH_SIZE) {
    const batch = await tempPrisma.notes.findMany({
      skip: offset,
      take: BATCH_SIZE,
      orderBy: { noteID: 'asc' },
    })

    for (const raw of batch) {
      const mappedAnimalId = animalIdMap.get(raw.animalID)

      if (mappedAnimalId === undefined) {
        stats.skippedRecords++
        stats.processedRecords++
        allLogs.push(
          createLog(
            'warning',
            `Orphan note skipped: original animalID ${raw.animalID} not imported`,
            {
              table: 'notes',
              recordId: raw.noteID,
            }
          )
        )
        continue
      }

      const result = validateNote(
        { ...raw, animalID: mappedAnimalId } as unknown as Record<
          string,
          unknown
        >,
        validAnimalIds
      )
      allLogs.push(...result.logs)

      if (result.skip || !result.data) {
        stats.skippedRecords++
        stats.processedRecords++
        continue
      }

      try {
        await prisma.notes.create({
          data: {
            animalID: mappedAnimalId,
            notes: result.data.notes,
            date: result.data.date,
          },
        })

        stats.validRecords++
      } catch (error) {
        stats.skippedRecords++
        allLogs.push(
          createLog(
            'error',
            `Failed to import note: ${error instanceof Error ? error.message : 'Unknown'}`,
            {
              table: 'notes',
              recordId: raw.noteID,
            }
          )
        )
      }

      stats.processedRecords++
    }

    onProgress?.({
      phase: 'importing',
      currentTable: 'notes',
      stats: { ...stats },
      logs: allLogs.slice(-10),
    })
  }

  return { stats }
}
