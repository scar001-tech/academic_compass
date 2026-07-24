// Database seed script
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create departments
  const departments = await Promise.all([
    prisma.department.create({
      data: {
        name: 'Mathematics',
        description: 'Department of Mathematics',
      },
    }),
    prisma.department.create({
      data: {
        name: 'Sciences',
        description: 'Department of Sciences',
      },
    }),
    prisma.department.create({
      data: {
        name: 'Languages',
        description: 'Department of Languages',
      },
    }),
  ])

  console.log(`✅ Created ${departments.length} departments`)

  // Create subjects
  const subjects = await Promise.all([
    prisma.subject.create({
      data: {
        name: 'Mathematics',
        code: 'MATH101',
        departmentId: departments[0].id,
      },
    }),
    prisma.subject.create({
      data: {
        name: 'Physics',
        code: 'PHY101',
        departmentId: departments[1].id,
      },
    }),
    prisma.subject.create({
      data: {
        name: 'English',
        code: 'ENG101',
        departmentId: departments[2].id,
      },
    }),
  ])

  console.log(`✅ Created ${subjects.length} subjects`)

  // Create a class
  const class1 = await prisma.class.create({
    data: {
      name: 'Form 1A',
      description: 'First year class A',
      departmentId: departments[0].id,
    },
  })

  console.log(`✅ Created class: ${class1.name}`)

  console.log('🎉 Database seeding completed!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
