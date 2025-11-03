import { PrismaClient } from '../../src/generated/prisma/index.js'

const prisma = new PrismaClient()

async function comprehensiveCleanup() {
  console.log('🧹 Starting Comprehensive Database Cleanup & Migration')
  console.log('='.repeat(70))
  console.log('This script will fix ALL known data inconsistencies:\n')
  console.log('  1. Convert postcode from integer to string')
  console.log('  2. Fix colour field (make nullable or add defaults)')
  console.log('  3. Update date field defaults')
  console.log('  4. Expand field sizes where needed')
  console.log('  5. Ensure all constraints are in place\n')
  console.log('⚠️  This will modify your database schema!')
  console.log('='.repeat(70))
  console.log()

  const results = {
    success: [],
    warnings: [],
    errors: [],
  }

  try {
    // =========================================================================
    // STEP 1: Fix Date Defaults & Data
    // =========================================================================
    console.log('📅 STEP 1: Fixing date fields...')

    // Fix invalid date data (if any remain)
    const fixedThisVisit = await prisma.$executeRawUnsafe(`
      UPDATE animal
      SET thisvisit = '1900-01-01'
      WHERE thisvisit = '0000-00-00'
         OR thisvisit < '1900-01-01'
    `)

    const fixedLastVisit = await prisma.$executeRawUnsafe(`
      UPDATE animal
      SET lastvisit = '1900-01-01'
      WHERE lastvisit = '0000-00-00'
         OR lastvisit < '1900-01-01'
    `)

    console.log(`  ✓ Fixed ${fixedThisVisit} thisvisit dates`)
    console.log(`  ✓ Fixed ${fixedLastVisit} lastvisit dates`)
    results.success.push(
      `Fixed ${fixedThisVisit + fixedLastVisit} invalid dates`
    )

    // Change date defaults to NULL and make nullable
    console.log('  • Updating date column defaults...')
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE animal
        MODIFY COLUMN thisvisit DATE NULL DEFAULT NULL
      `)
      await prisma.$executeRawUnsafe(`
        ALTER TABLE animal
        MODIFY COLUMN lastvisit DATE NULL DEFAULT NULL
      `)
      console.log('  ✓ Date columns now nullable with NULL default')
      results.success.push('Updated date column defaults to NULL')
    } catch (error) {
      results.warnings.push(`Date column update: ${error.message}`)
    }

    // =========================================================================
    // STEP 2: Fix Postcode Field
    // =========================================================================
    console.log('\n📮 STEP 2: Converting postcode from integer to string...')

    try {
      // Convert the column type
      await prisma.$executeRawUnsafe(`
        ALTER TABLE customer
        MODIFY COLUMN postcode VARCHAR(10) NULL DEFAULT NULL
      `)
      console.log('  ✓ Postcode converted to VARCHAR(10)')
      results.success.push('Converted postcode to string type')

      // Check for any 0 defaults and convert to NULL
      const nulledPostcodes = await prisma.$executeRawUnsafe(`
        UPDATE customer
        SET postcode = NULL
        WHERE postcode = '0' OR postcode = ''
      `)
      console.log(`  ✓ Cleaned up ${nulledPostcodes} zero/empty postcodes`)
    } catch (error) {
      results.errors.push(`Postcode conversion: ${error.message}`)
    }

    // =========================================================================
    // STEP 3: Fix Colour Field
    // =========================================================================
    console.log('\n🎨 STEP 3: Fixing colour field...')

    try {
      // Make colour nullable or set a default
      await prisma.$executeRawUnsafe(`
        ALTER TABLE animal
        MODIFY COLUMN colour VARCHAR(100) NULL DEFAULT NULL
      `)
      console.log('  ✓ Colour is now nullable VARCHAR(100)')
      results.success.push('Made colour field nullable')

      // Clean up empty strings
      const nulledColours = await prisma.$executeRawUnsafe(`
        UPDATE animal
        SET colour = NULL
        WHERE colour = ''
      `)
      console.log(`  ✓ Converted ${nulledColours} empty colours to NULL`)
    } catch (error) {
      results.errors.push(`Colour fix: ${error.message}`)
    }

    // =========================================================================
    // STEP 4: Expand Field Sizes
    // =========================================================================
    console.log('\n📏 STEP 4: Expanding field sizes to match Prisma schema...')

    const fieldExpansions = [
      { table: 'customer', field: 'surname', type: 'VARCHAR(50)' },
      { table: 'customer', field: 'firstname', type: 'VARCHAR(50)' },
      { table: 'customer', field: 'address', type: 'VARCHAR(100)' },
      { table: 'customer', field: 'suburb', type: 'VARCHAR(50)' },
      { table: 'customer', field: 'phone1', type: 'VARCHAR(20)' },
      { table: 'customer', field: 'phone2', type: 'VARCHAR(20)' },
      { table: 'customer', field: 'phone3', type: 'VARCHAR(20)' },
      { table: 'animal', field: 'animalname', type: 'VARCHAR(50)' },
    ]

    for (const { table, field, type } of fieldExpansions) {
      try {
        await prisma.$executeRawUnsafe(`
          ALTER TABLE ${table}
          MODIFY COLUMN ${field} ${type}
        `)
        console.log(`  ✓ Expanded ${table}.${field} to ${type}`)
        results.success.push(`Expanded ${table}.${field}`)
      } catch (error) {
        results.warnings.push(
          `Field expansion ${table}.${field}: ${error.message}`
        )
      }
    }

    // =========================================================================
    // STEP 5: Ensure Constraints Are in Place
    // =========================================================================
    console.log('\n🔒 STEP 5: Verifying/adding constraints...')

    // Date constraints (may already exist)
    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE animal
        ADD CONSTRAINT chk_thisvisit_valid
        CHECK (thisvisit IS NULL OR thisvisit >= '1900-01-01')
      `)
      console.log('  ✓ Added thisvisit constraint')
      results.success.push('Added thisvisit constraint')
    } catch (error) {
      if (error.message.includes('Duplicate')) {
        console.log('  • thisvisit constraint already exists')
      } else {
        results.warnings.push(`thisvisit constraint: ${error.message}`)
      }
    }

    try {
      await prisma.$executeRawUnsafe(`
        ALTER TABLE animal
        ADD CONSTRAINT chk_lastvisit_valid
        CHECK (lastvisit IS NULL OR lastvisit >= '1900-01-01')
      `)
      console.log('  ✓ Added lastvisit constraint')
      results.success.push('Added lastvisit constraint')
    } catch (error) {
      if (error.message.includes('Duplicate')) {
        console.log('  • lastvisit constraint already exists')
      } else {
        results.warnings.push(`lastvisit constraint: ${error.message}`)
      }
    }

    // =========================================================================
    // FINAL VERIFICATION
    // =========================================================================
    console.log('\n\n🔍 STEP 6: Verifying cleanup...')

    // Test that we can now query without errors
    try {
      const testQuery = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM customer LIMIT 1
      `
      console.log('  ✓ Customer table queries successfully')

      const testAnimalQuery = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM animal LIMIT 1
      `
      console.log('  ✓ Animal table queries successfully')

      results.success.push('Database queries working')
    } catch (error) {
      results.errors.push(`Verification failed: ${error.message}`)
    }

    // =========================================================================
    // SUMMARY
    // =========================================================================
    console.log('\n\n' + '='.repeat(70))
    console.log('📊 CLEANUP SUMMARY')
    console.log('='.repeat(70))

    if (results.success.length > 0) {
      console.log(`\n✅ Successful Operations (${results.success.length}):`)
      results.success.forEach(msg => console.log(`   • ${msg}`))
    }

    if (results.warnings.length > 0) {
      console.log(`\n⚠️  Warnings (${results.warnings.length}):`)
      results.warnings.forEach(msg => console.log(`   • ${msg}`))
    }

    if (results.errors.length > 0) {
      console.log(`\n❌ Errors (${results.errors.length}):`)
      results.errors.forEach(msg => console.log(`   • ${msg}`))
    }

    console.log('\n' + '='.repeat(70))
    console.log('NEXT STEPS:')
    console.log('='.repeat(70))
    console.log(
      '1. Update prisma/schema.prisma to match the new database schema'
    )
    console.log('2. Run: pnpm prisma generate')
    console.log('3. Test your application searches')
    console.log('4. Document these changes for production migration\n')

    if (results.errors.length === 0) {
      console.log('✅ Database cleanup completed successfully!\n')
    } else {
      console.log('⚠️  Cleanup completed with some errors. Review above.\n')
    }
  } catch (error) {
    console.error('\n❌ Fatal error during cleanup:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

comprehensiveCleanup()
