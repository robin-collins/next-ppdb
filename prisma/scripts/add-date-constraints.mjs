import { PrismaClient } from '../../src/generated/prisma/index.js'

const prisma = new PrismaClient()

async function addDateConstraints() {
  console.log('🔧 Adding date validation constraints to animal table...\n')

  try {
    // Check MySQL version (constraints require MySQL 8.0.16+)
    console.log('Step 1: Checking MySQL version...')
    const versionResult = await prisma.$queryRaw`SELECT VERSION() as version`
    const version = versionResult[0].version
    console.log(`  MySQL version: ${version}\n`)

    // Add constraint for thisvisit
    console.log('Step 2: Adding constraint for thisvisit...')
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE animal
        ADD CONSTRAINT chk_thisvisit_valid
        CHECK (thisvisit IS NULL OR thisvisit >= '1900-01-01')
      `)
      console.log('  ✓ Constraint chk_thisvisit_valid added successfully\n')
    } catch (error) {
      if (error.message.includes('Duplicate key name')) {
        console.log('  ⚠️  Constraint chk_thisvisit_valid already exists\n')
      } else {
        throw error
      }
    }

    // Add constraint for lastvisit
    console.log('Step 3: Adding constraint for lastvisit...')
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE animal
        ADD CONSTRAINT chk_lastvisit_valid
        CHECK (lastvisit IS NULL OR lastvisit >= '1900-01-01')
      `)
      console.log('  ✓ Constraint chk_lastvisit_valid added successfully\n')
    } catch (error) {
      if (error.message.includes('Duplicate key name')) {
        console.log('  ⚠️  Constraint chk_lastvisit_valid already exists\n')
      } else {
        throw error
      }
    }

    // Verify constraints were added
    console.log('Step 4: Verifying constraints...')
    const constraints = await prisma.$queryRawUnsafe(`
      SELECT
          CONSTRAINT_NAME,
          CHECK_CLAUSE
      FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS
      WHERE CONSTRAINT_SCHEMA = DATABASE()
        AND TABLE_NAME = 'animal'
        AND CONSTRAINT_NAME IN ('chk_thisvisit_valid', 'chk_lastvisit_valid')
    `)

    if (constraints.length > 0) {
      console.log('  Active date constraints:')
      constraints.forEach(constraint => {
        console.log(
          `    - ${constraint.CONSTRAINT_NAME}: ${constraint.CHECK_CLAUSE}`
        )
      })
      console.log()
    }

    console.log('✅ Success! Date validation constraints are now active.')
    console.log(
      '   The database will now reject any dates before 1900-01-01.\n'
    )

    // Test the constraint (optional)
    console.log(
      'Step 5: Testing constraint (attempting to insert invalid date)...'
    )
    try {
      await prisma.$executeRawUnsafe(`
        INSERT INTO animal (animalname, breedID, customerID, sex, thisvisit)
        VALUES ('__TEST_INVALID__', 1, 1, 'Male', '1899-12-31')
      `)
      console.log(
        '  ⚠️  WARNING: Invalid date was accepted! Constraint may not be working.\n'
      )
    } catch (error) {
      if (error.message.includes('Check constraint')) {
        console.log(
          '  ✓ Constraint is working! Invalid date was rejected as expected.\n'
        )
      } else {
        console.log(`  ⚠️  Different error occurred: ${error.message}\n`)
      }
    }
  } catch (error) {
    console.error('❌ Error adding constraints:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

addDateConstraints()
