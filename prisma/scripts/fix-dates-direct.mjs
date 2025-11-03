import { PrismaClient } from '../../src/generated/prisma/index.js'

const prisma = new PrismaClient()

async function fixInvalidDates() {
  console.log('🔧 Fixing invalid dates in animal table...\n')

  try {
    // Fix thisvisit dates directly - no reading, just updating
    console.log('Fixing invalid thisvisit dates...')
    const fixedThisVisit = await prisma.$executeRawUnsafe(`
      UPDATE animal
      SET thisvisit = '1900-01-01 00:00:00'
      WHERE thisvisit = '0000-00-00'
         OR thisvisit = '0000-00-00 00:00:00'
         OR YEAR(thisvisit) = 0
         OR MONTH(thisvisit) = 0
         OR DAY(thisvisit) = 0
    `)

    console.log(`✓ Updated ${fixedThisVisit} thisvisit records\n`)

    // Fix lastvisit dates directly
    console.log('Fixing invalid lastvisit dates...')
    const fixedLastVisit = await prisma.$executeRawUnsafe(`
      UPDATE animal
      SET lastvisit = '1900-01-01 00:00:00'
      WHERE lastvisit = '0000-00-00'
         OR lastvisit = '0000-00-00 00:00:00'
         OR YEAR(lastvisit) = 0
         OR MONTH(lastvisit) = 0
         OR DAY(lastvisit) = 0
    `)

    console.log(`✓ Updated ${fixedLastVisit} lastvisit records\n`)

    console.log('✅ Success! All invalid dates have been fixed.')
    console.log(
      '   Invalid dates have been set to 1900-01-01, which Prisma can handle.\n'
    )

    // Now try to read a sample to verify
    console.log('Verifying fix by reading sample records...')
    const sample = await prisma.animal.findMany({
      take: 3,
      include: { customer: true, breed: true },
    })

    console.log(`✓ Successfully read ${sample.length} records`)
    console.log('  Database is now ready for use!\n')
  } catch (error) {
    console.error('❌ Error:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

fixInvalidDates()
