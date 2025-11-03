import { PrismaClient } from '../../src/generated/prisma/index.js'

const prisma = new PrismaClient()

async function testDateValidation() {
  console.log('🧪 Testing date validation at database level...\n')

  const testResults = { passed: 0, failed: 0 }

  try {
    // Get a valid customer and breed ID for testing using raw SQL
    // (avoiding Prisma type conversion issues with postcode)
    const customers =
      await prisma.$queryRaw`SELECT customerID FROM customer LIMIT 1`
    const breeds = await prisma.$queryRaw`SELECT breedID FROM breed LIMIT 1`

    if (
      !customers ||
      customers.length === 0 ||
      !breeds ||
      breeds.length === 0
    ) {
      console.error(
        '❌ No customer or breed found in database. Cannot run tests.'
      )
      return
    }

    const customerID = customers[0].customerID
    const breedID = breeds[0].breedID

    console.log('Using test data:')
    console.log(`  Customer ID: ${customerID}`)
    console.log(`  Breed ID: ${breedID}\n`)

    // ==============================================================================
    // Database Constraint Tests
    // ==============================================================================
    console.log('📋 Database Constraint Tests')
    console.log('='.repeat(60))

    // Test 1: Valid date (should pass)
    console.log('\n1. Testing VALID date directly in database...')
    try {
      const result = await prisma.animal.create({
        data: {
          customerID: customerID,
          animalname: '__TEST_VALID__',
          breedID: breedID,
          sex: 'Male',
          colour: 'Brown',
          thisvisit: new Date('2024-01-15'),
          lastvisit: new Date('2024-01-15'),
        },
      })
      await prisma.animal.delete({ where: { animalID: result.animalID } })
      console.log('  ✅ PASS: Valid date accepted by database')
      testResults.passed++
    } catch (error) {
      console.log('  ❌ FAIL: Valid date rejected by database')
      console.log(`     Error: ${error.message}`)
      testResults.failed++
    }

    // Test 2: Invalid ancient date (should fail)
    console.log('\n2. Testing INVALID ancient date (1899-12-31) in database...')
    try {
      await prisma.animal.create({
        data: {
          customerID: customerID,
          animalname: '__TEST_INVALID__',
          breedID: breedID,
          sex: 'Male',
          colour: 'Brown',
          thisvisit: new Date('1899-12-31'),
        },
      })
      console.log(
        '  ❌ FAIL: Ancient date was accepted by database (should be rejected)'
      )
      testResults.failed++
    } catch (error) {
      if (
        error.message.includes('Check constraint') ||
        error.code === 'P2010'
      ) {
        console.log(
          '  ✅ PASS: Ancient date correctly rejected by database constraint'
        )
        testResults.passed++
      } else {
        console.log('  ⚠️  Different error occurred:', error.message)
        testResults.failed++
      }
    }

    // Test 3: Minimum valid date (should pass)
    console.log('\n3. Testing MINIMUM valid date (1900-01-01) in database...')
    try {
      const result = await prisma.animal.create({
        data: {
          customerID: customerID,
          animalname: '__TEST_MINIMUM__',
          breedID: breedID,
          sex: 'Male',
          thisvisit: new Date('1900-01-01'),
          lastvisit: new Date('1900-01-01'),
        },
      })
      await prisma.animal.delete({ where: { animalID: result.animalID } })
      console.log('  ✅ PASS: Minimum date (1900-01-01) accepted by database')
      testResults.passed++
    } catch (error) {
      console.log('  ❌ FAIL: Minimum date rejected by database')
      console.log(`     Error: ${error.message}`)
      testResults.failed++
    }

    // Test 4: NULL dates (should pass)
    console.log('\n4. Testing NULL dates in database...')
    try {
      const result = await prisma.animal.create({
        data: {
          customerID: customerID,
          animalname: '__TEST_NULL__',
          breedID: breedID,
          sex: 'Male',
          thisvisit: null,
          lastvisit: null,
        },
      })
      await prisma.animal.delete({ where: { animalID: result.animalID } })
      console.log('  ✅ PASS: NULL dates accepted by database')
      testResults.passed++
    } catch (error) {
      console.log('  ❌ FAIL: NULL dates rejected by database')
      console.log(`     Error: ${error.message}`)
      testResults.failed++
    }

    // ==============================================================================
    // Summary
    // ==============================================================================
    console.log('\n\n📊 Test Summary')
    console.log('='.repeat(60))
    console.log(`\n${testResults.passed} passed, ${testResults.failed} failed`)

    if (testResults.failed === 0) {
      console.log(
        '\n✅ All validation tests passed! Date validation is working correctly.'
      )
      console.log(
        '   - Database constraints successfully prevent dates before 1900-01-01'
      )
      console.log('   - NULL dates are allowed')
      console.log('   - Valid dates are accepted\n')
    } else {
      console.log(
        '\n⚠️  Some tests failed. Please review the validation implementation.\n'
      )
    }
  } catch (error) {
    console.error('❌ Test error:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

testDateValidation()
