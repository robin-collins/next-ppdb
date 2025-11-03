import { PrismaClient } from './src/generated/prisma/index.js'

const prisma = new PrismaClient()

async function checkDatabase() {
  try {
    const animalCount = await prisma.animal.count()
    console.log('Total animals in DB:', animalCount)

    if (animalCount > 0) {
      const sample = await prisma.animal.findMany({
        take: 3,
        include: { customer: true, breed: true },
      })

      console.log('\nSample records:')
      sample.forEach((animal, i) => {
        console.log(`\n${i + 1}. Animal: ${animal.animalname}`)
        console.log(`   Breed: ${animal.breed.breedname}`)
        console.log(
          `   Customer: ${animal.customer.firstname} ${animal.customer.surname}`
        )
        console.log(`   Email: ${animal.customer.email || 'N/A'}`)
        console.log(`   Phone1: ${animal.customer.phone1 || 'N/A'}`)
      })
    }
  } catch (error) {
    console.error('Database error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase()
