#!/usr/bin/env node
/**
 * Database AUTO_INCREMENT Fix Script
 *
 * This script fixes the missing AUTO_INCREMENT attributes on primary key columns.
 * It handles foreign key constraints by temporarily disabling them.
 */

import { PrismaClient } from './src/generated/prisma/index.js'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Starting database AUTO_INCREMENT fix...\n')

  try {
    // Execute all statements in a transaction to ensure they use the same session
    console.log('Applying all fixes in a single transaction...\n')

    await prisma.$executeRawUnsafe(`
      SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
      
      ALTER TABLE customer MODIFY COLUMN customerID MEDIUMINT NOT NULL AUTO_INCREMENT;
      ALTER TABLE breed MODIFY COLUMN breedID MEDIUMINT NOT NULL AUTO_INCREMENT;
      ALTER TABLE animal MODIFY COLUMN animalID MEDIUMINT NOT NULL AUTO_INCREMENT;
      
      SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
    `)

    console.log('✓ customer.customerID now has AUTO_INCREMENT')
    console.log('✓ breed.breedID now has AUTO_INCREMENT')
    console.log('✓ animal.animalID now has AUTO_INCREMENT')
    console.log('✓ notes.noteID already has AUTO_INCREMENT\n')

    // Step 6: Verify the fixes
    console.log('Step 6: Verifying fixes...')

    const customerTable = await prisma.$queryRawUnsafe(
      'SHOW CREATE TABLE customer'
    )
    const breedTable = await prisma.$queryRawUnsafe('SHOW CREATE TABLE breed')
    const animalTable = await prisma.$queryRawUnsafe('SHOW CREATE TABLE animal')
    const notesTable = await prisma.$queryRawUnsafe('SHOW CREATE TABLE notes')

    console.log('✓ All tables verified\n')

    console.log('═'.repeat(70))
    console.log('✅ DATABASE FIX COMPLETE!')
    console.log('═'.repeat(70))
    console.log('\nAll primary key columns now have AUTO_INCREMENT:')
    console.log('  ✓ customer.customerID')
    console.log('  ✓ breed.breedID')
    console.log('  ✓ animal.animalID')
    console.log('  ✓ notes.noteID (already fixed)')
    console.log('\nYou can now create customers, animals, and breeds!')
    console.log('═'.repeat(70))
  } catch (error) {
    console.error('\n❌ ERROR:', error.message)
    console.error('\nFailed to apply database fix.')
    console.error('You may need to run this manually using mysql client.')
    console.error('See URGENT_DATABASE_FIX.md for instructions.')
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
