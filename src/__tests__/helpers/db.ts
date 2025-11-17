/**
 * Database Test Utilities
 *
 * Provides helpers for managing test database connections, cleanup, and seeding.
 * These utilities support both mocked unit tests and real integration tests.
 */

import { PrismaClient } from '@/generated/prisma'

let testPrisma: PrismaClient | null = null

/**
 * Initialize Prisma client for testing
 * Uses DATABASE_URL_TESTING if available, otherwise uses DATABASE_URL
 */
export function setupTestDB(): PrismaClient {
  if (testPrisma) {
    return testPrisma
  }

  const databaseUrl =
    process.env.DATABASE_URL_TESTING || process.env.DATABASE_URL

  testPrisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  })

  return testPrisma
}

/**
 * Clean up test database by truncating all tables
 * Respects foreign key constraints by truncating in correct order
 */
export async function cleanupTestDB(): Promise<void> {
  if (!testPrisma) {
    throw new Error('Test database not initialized. Call setupTestDB() first.')
  }

  try {
    // Truncate tables in order that respects foreign keys
    // notes references animal
    // animal references customer and breed
    await testPrisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`

    await testPrisma.$executeRaw`TRUNCATE TABLE notes;`
    await testPrisma.$executeRaw`TRUNCATE TABLE animal;`
    await testPrisma.$executeRaw`TRUNCATE TABLE customer;`
    await testPrisma.$executeRaw`TRUNCATE TABLE breed;`

    await testPrisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`
  } catch (error) {
    console.error('Error cleaning up test database:', error)
    throw error
  }
}

/**
 * Disconnect from test database
 * Should be called in afterAll hooks
 */
export async function disconnectTestDB(): Promise<void> {
  if (testPrisma) {
    await testPrisma.$disconnect()
    testPrisma = null
  }
}

/**
 * Seed test database with fixture data
 * Returns references to created records for use in tests
 */
export async function seedTestData() {
  if (!testPrisma) {
    throw new Error('Test database not initialized. Call setupTestDB() first.')
  }

  // Import fixtures
  const { testBreeds } = await import('../fixtures/breeds')
  const { testCustomers } = await import('../fixtures/customers')
  const { testAnimals } = await import('../fixtures/animals')
  const { testNotes } = await import('../fixtures/notes')

  // Create breeds first (referenced by animals)
  const breeds = await Promise.all(
    testBreeds.map(breed => testPrisma!.breed.create({ data: breed }))
  )

  // Create customers (referenced by animals)
  const customers = await Promise.all(
    testCustomers.map(customer =>
      testPrisma!.customer.create({ data: customer })
    )
  )

  // Create animals (references breeds and customers)
  const animals = await Promise.all(
    testAnimals.map((animal, index) =>
      testPrisma!.animal.create({
        data: {
          ...animal,
          breedID: breeds[index % breeds.length].breedID,
          customerID: customers[index % customers.length].customerID,
        },
      })
    )
  )

  // Create notes (references animals)
  const notes = await Promise.all(
    testNotes.map((note, index) =>
      testPrisma!.notes.create({
        data: {
          ...note,
          animalID: animals[index % animals.length].animalID,
        },
      })
    )
  )

  return {
    breeds,
    customers,
    animals,
    notes,
  }
}

/**
 * Get test Prisma client instance
 * Useful for tests that need direct database access
 */
export function getTestPrisma(): PrismaClient {
  if (!testPrisma) {
    throw new Error('Test database not initialized. Call setupTestDB() first.')
  }
  return testPrisma
}
