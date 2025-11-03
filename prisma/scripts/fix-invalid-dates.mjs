import { PrismaClient } from '../../src/generated/prisma/index.js'

const prisma = new PrismaClient()

async function fixInvalidDates() {
  console.log('🔍 Checking for invalid dates in animal table...\n')

  try {
    // Step 1: Count invalid dates
    console.log('Step 1: Identifying invalid dates...')

    const invalidThisVisit = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM animal
      WHERE thisvisit = '0000-00-00'
         OR thisvisit = '0000-00-00 00:00:00'
         OR YEAR(thisvisit) = 0
         OR MONTH(thisvisit) = 0
         OR DAY(thisvisit) = 0
    `

    const invalidLastVisit = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM animal
      WHERE lastvisit = '0000-00-00'
         OR lastvisit = '0000-00-00 00:00:00'
         OR YEAR(lastvisit) = 0
         OR MONTH(lastvisit) = 0
         OR DAY(lastvisit) = 0
    `

    const thisVisitCount = Number(invalidThisVisit[0].count)
    const lastVisitCount = Number(invalidLastVisit[0].count)

    console.log(`  - Invalid 'thisvisit' dates: ${thisVisitCount}`)
    console.log(`  - Invalid 'lastvisit' dates: ${lastVisitCount}\n`)

    if (thisVisitCount === 0 && lastVisitCount === 0) {
      console.log('✅ No invalid dates found. Database is clean!')
      return
    }

    // Step 2: Show sample records
    console.log('Step 2: Sample records with invalid dates:')
    const samples = await prisma.$queryRaw`
      SELECT
          animalID,
          animalname,
          thisvisit,
          lastvisit
      FROM animal
      WHERE (thisvisit = '0000-00-00' OR YEAR(thisvisit) = 0 OR MONTH(thisvisit) = 0 OR DAY(thisvisit) = 0)
         OR (lastvisit = '0000-00-00' OR YEAR(lastvisit) = 0 OR MONTH(lastvisit) = 0 OR DAY(lastvisit) = 0)
      LIMIT 5
    `

    samples.forEach((record, i) => {
      console.log(
        `  ${i + 1}. Animal ID ${record.animalID}: ${record.animalname}`
      )
      console.log(`     thisvisit: ${record.thisvisit}`)
      console.log(`     lastvisit: ${record.lastvisit}`)
    })
    console.log()

    // Step 3: Ask for confirmation (auto-proceed in this script)
    console.log('Step 3: Fixing invalid dates...')
    console.log('  Setting invalid dates to 1900-01-01 00:00:00\n')

    // Fix thisvisit dates
    const fixedThisVisit = await prisma.$executeRaw`
      UPDATE animal
      SET thisvisit = '1900-01-01 00:00:00'
      WHERE thisvisit = '0000-00-00'
         OR thisvisit = '0000-00-00 00:00:00'
         OR YEAR(thisvisit) = 0
         OR MONTH(thisvisit) = 0
         OR DAY(thisvisit) = 0
    `

    console.log(`  ✓ Fixed ${fixedThisVisit} 'thisvisit' records`)

    // Fix lastvisit dates
    const fixedLastVisit = await prisma.$executeRaw`
      UPDATE animal
      SET lastvisit = '1900-01-01 00:00:00'
      WHERE lastvisit = '0000-00-00'
         OR lastvisit = '0000-00-00 00:00:00'
         OR YEAR(lastvisit) = 0
         OR MONTH(lastvisit) = 0
         OR DAY(lastvisit) = 0
    `

    console.log(`  ✓ Fixed ${fixedLastVisit} 'lastvisit' records\n`)

    // Step 4: Verify fix
    console.log('Step 4: Verifying fix...')

    const verifyThisVisit = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM animal
      WHERE thisvisit = '0000-00-00'
         OR thisvisit = '0000-00-00 00:00:00'
         OR YEAR(thisvisit) = 0
         OR MONTH(thisvisit) = 0
         OR DAY(thisvisit) = 0
    `

    const verifyLastVisit = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM animal
      WHERE lastvisit = '0000-00-00'
         OR lastvisit = '0000-00-00 00:00:00'
         OR YEAR(lastvisit) = 0
         OR MONTH(lastvisit) = 0
         OR DAY(lastvisit) = 0
    `

    const remainingThisVisit = Number(verifyThisVisit[0].count)
    const remainingLastVisit = Number(verifyLastVisit[0].count)

    console.log(`  - Remaining invalid 'thisvisit': ${remainingThisVisit}`)
    console.log(`  - Remaining invalid 'lastvisit': ${remainingLastVisit}\n`)

    if (remainingThisVisit === 0 && remainingLastVisit === 0) {
      console.log('✅ Success! All invalid dates have been fixed.')
      console.log(
        '   Invalid dates have been set to 1900-01-01, which Prisma can handle.\n'
      )
    } else {
      console.log('⚠️  Warning: Some invalid dates may still remain.')
    }
  } catch (error) {
    console.error('❌ Error fixing dates:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

fixInvalidDates()
