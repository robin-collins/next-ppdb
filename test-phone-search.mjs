import { PrismaClient } from './src/generated/prisma/index.js'

const prisma = new PrismaClient({
  log: ['query'],
})

async function main() {
  console.log('\n=== Testing Phone Search ===\n')
  
  // Check if customer 7742 exists and has an animal
  console.log('1. Checking customer 7742 (collins):')
  const customer = await prisma.customer.findUnique({
    where: { customerID: 7742 },
    include: { animal: true }
  })
  console.log('Customer:', {
    customerID: customer?.customerID,
    surname: customer?.surname,
    phone1: customer?.phone1,
    phone2: customer?.phone2,
    animalCount: customer?.animal.length
  })
  
  // Try searching with contains
  console.log('\n2. Searching with Prisma contains "047579573":')
  const results1 = await prisma.animal.findMany({
    where: {
      OR: [
        { customer: { phone1: { contains: '047579573' } } },
        { customer: { phone2: { contains: '047579573' } } },
      ]
    },
    include: { customer: true },
    take: 5
  })
  console.log('Results:', results1.length)
  
  // Try searching with contains "0475795732"
  console.log('\n3. Searching with Prisma contains "0475795732":')
  const results2 = await prisma.animal.findMany({
    where: {
      OR: [
        { customer: { phone1: { contains: '0475795732' } } },
        { customer: { phone2: { contains: '0475795732' } } },
      ]
    },
    include: { customer: true },
    take: 5
  })
  console.log('Results:', results2.length)
  if (results2[0]) {
    console.log('First match:', {
      animalID: results2[0].animalID,
      animalname: results2[0].animalname,
      surname: results2[0].customer.surname,
      phone1: results2[0].customer.phone1
    })
  }
  
  // Raw query test
  console.log('\n4. Raw SQL test:')
  const rawResults = await prisma.$queryRaw`
    SELECT a.animalID, a.animalname, c.surname, c.phone1, c.phone2
    FROM animal a
    JOIN customer c ON a.customerID = c.customerID
    WHERE c.phone1 LIKE '%047579573%' OR c.phone2 LIKE '%047579573%'
    LIMIT 5
  `
  console.log('Raw query results:', rawResults.length)
  console.log(rawResults)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
