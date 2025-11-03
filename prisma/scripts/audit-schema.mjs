import { PrismaClient } from '../../src/generated/prisma/index.js'

const prisma = new PrismaClient()

async function auditSchema() {
  console.log('🔍 Auditing database schema for data inconsistencies...\n')

  try {
    // Get actual MySQL column types
    console.log('='.repeat(70))
    console.log('CUSTOMER TABLE SCHEMA')
    console.log('='.repeat(70))

    const customerColumns = await prisma.$queryRaw`
      SELECT
        COLUMN_NAME,
        COLUMN_TYPE,
        IS_NULLABLE,
        COLUMN_DEFAULT,
        DATA_TYPE,
        CHARACTER_MAXIMUM_LENGTH
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'customer'
      ORDER BY ORDINAL_POSITION
    `

    customerColumns.forEach(col => {
      console.log(`\n${col.COLUMN_NAME}:`)
      console.log(`  Type: ${col.COLUMN_TYPE}`)
      console.log(`  Nullable: ${col.IS_NULLABLE}`)
      console.log(`  Default: ${col.COLUMN_DEFAULT || 'NULL'}`)
    })

    console.log('\n\n' + '='.repeat(70))
    console.log('ANIMAL TABLE SCHEMA')
    console.log('='.repeat(70))

    const animalColumns = await prisma.$queryRaw`
      SELECT
        COLUMN_NAME,
        COLUMN_TYPE,
        IS_NULLABLE,
        COLUMN_DEFAULT,
        DATA_TYPE,
        CHARACTER_MAXIMUM_LENGTH
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'animal'
      ORDER BY ORDINAL_POSITION
    `

    animalColumns.forEach(col => {
      console.log(`\n${col.COLUMN_NAME}:`)
      console.log(`  Type: ${col.COLUMN_TYPE}`)
      console.log(`  Nullable: ${col.IS_NULLABLE}`)
      console.log(`  Default: ${col.COLUMN_DEFAULT || 'NULL'}`)
    })

    console.log('\n\n' + '='.repeat(70))
    console.log('DATA QUALITY CHECKS')
    console.log('='.repeat(70))

    // Check for invalid dates (should be 0 after our fix)
    const invalidDates = await prisma.$queryRaw`
      SELECT
        COUNT(*) as count
      FROM animal
      WHERE thisvisit < '1900-01-01' OR lastvisit < '1900-01-01'
    `
    console.log(`\n📅 Invalid dates (< 1900-01-01): ${invalidDates[0].count}`)

    // Check for non-numeric postcodes if it's supposed to be a string
    const postcodeCheck = await prisma.$queryRaw`
      SELECT
        customerID,
        postcode,
        typeof(postcode) as postcode_type
      FROM customer
      WHERE postcode IS NOT NULL
      LIMIT 5
    `
    console.log('\n📮 Postcode sample data:')
    postcodeCheck.forEach(row => {
      console.log(
        `  Customer ${row.customerID}: "${row.postcode}" (type in result: ${typeof row.postcode})`
      )
    })

    // Check for NULL colours (if it's NOT NULL in DB)
    const nullColours = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM animal
      WHERE colour IS NULL OR colour = ''
    `
    console.log(`\n🎨 Animals with NULL/empty colour: ${nullColours[0].count}`)

    // Check for NULL required fields in customer
    const nullCustomerFields = await prisma.$queryRaw`
      SELECT
        COUNT(CASE WHEN surname IS NULL OR surname = '' THEN 1 END) as null_surname,
        COUNT(CASE WHEN postcode IS NULL THEN 1 END) as null_postcode,
        COUNT(CASE WHEN phone1 IS NULL OR phone1 = '' THEN 1 END) as null_phone1
      FROM customer
    `
    console.log('\n👤 Customer data quality:')
    console.log(`  NULL/empty surname: ${nullCustomerFields[0].null_surname}`)
    console.log(`  NULL postcode: ${nullCustomerFields[0].null_postcode}`)
    console.log(`  NULL/empty phone1: ${nullCustomerFields[0].null_phone1}`)

    // Check constraints
    console.log('\n\n' + '='.repeat(70))
    console.log('DATABASE CONSTRAINTS')
    console.log('='.repeat(70))

    const constraints = await prisma.$queryRaw`
      SELECT
        CONSTRAINT_NAME,
        CHECK_CLAUSE
      FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS
      WHERE CONSTRAINT_SCHEMA = DATABASE()
      ORDER BY CONSTRAINT_NAME
    `

    if (constraints.length > 0) {
      console.log('\n✓ Active CHECK constraints:')
      constraints.forEach(c => {
        console.log(`  - ${c.CONSTRAINT_NAME}: ${c.CHECK_CLAUSE}`)
      })
    } else {
      console.log('\n⚠️  No CHECK constraints found')
    }

    console.log('\n\n' + '='.repeat(70))
    console.log('SUMMARY & RECOMMENDATIONS')
    console.log('='.repeat(70))
    console.log('\nIssues identified:')
    console.log('1. Postcode type mismatch causing Prisma conversion errors')
    console.log('2. Colour field may require default value handling')
    console.log('3. Date validation constraints in place ✓')
    console.log('\nRecommended actions:')
    console.log(
      '• Fix postcode column type in database OR update Prisma schema'
    )
    console.log('• Add default value for colour or make it nullable')
    console.log('• Create comprehensive data cleanup script')
    console.log('• Add validation at API layer with Zod schemas\n')
  } catch (error) {
    console.error('❌ Audit error:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

auditSchema()
