import { PrismaClient, UserRole, StudentStatus, LicenseTier, SessionType, PaymentStatus } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import { config } from 'dotenv'

// Load environment variables
config({ path: '.env.local' })

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Create adapter
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({
  adapter,
})

async function main() {
  console.log('Starting database seeding...')

  // Create test organization
  const organization = await prisma.organization.upsert({
    where: { id: 'test-org-1' },
    update: {},
    create: {
      id: 'test-org-1',
      name: 'Test Martial Arts Academy',
      slug: 'test-martial-arts-academy',
      licenseTier: LicenseTier.PROFESSIONAL,
      subscriptionStatus: 'ACTIVE',
    },
  })

  console.log('Created organization:', organization.name)

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      name: 'Test Admin',
      password: hashedPassword,
      role: UserRole.ADMIN,
      organizationId: organization.id,
    },
  })

  console.log('Created admin user:', adminUser.email)

  // Create trainer user
  const trainerPassword = await bcrypt.hash('trainer123', 10)
  const trainerUser = await prisma.user.upsert({
    where: { email: 'trainer@test.com' },
    update: {},
    create: {
      email: 'trainer@test.com',
      name: 'Test Trainer',
      password: trainerPassword,
      role: UserRole.TRAINER,
      organizationId: organization.id,
    },
  })

  console.log('Created trainer user:', trainerUser.email)

  // Create test students
  const students = await Promise.all([
    prisma.student.upsert({
      where: { id: 'student-1' },
      update: {},
      create: {
        id: 'student-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@test.com',
        phone: '+1234567890',
        dateOfBirth: new Date('2000-01-01'),
        beltLevel: 'White Belt',
        status: StudentStatus.ACTIVE,
        organizationId: organization.id,
      },
    }),
    prisma.student.upsert({
      where: { id: 'student-2' },
      update: {},
      create: {
        id: 'student-2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@test.com',
        phone: '+1234567891',
        dateOfBirth: new Date('1999-05-15'),
        beltLevel: 'Blue Belt',
        status: StudentStatus.ACTIVE,
        organizationId: organization.id,
      },
    }),
    prisma.student.upsert({
      where: { id: 'student-3' },
      update: {},
      create: {
        id: 'student-3',
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike@test.com',
        phone: '+1234567892',
        beltLevel: 'Yellow Belt',
        status: StudentStatus.ACTIVE,
        organizationId: organization.id,
      },
    }),
  ])

  console.log('Created test students:', students.length)

  // Create test sessions
  const sessions = await Promise.all([
    prisma.session.create({
      data: {
        title: 'Beginner Class',
        description: 'Introduction to martial arts fundamentals',
        trainerId: trainerUser.id,
        organizationId: organization.id,
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        capacity: 20,
        location: 'Main Dojo',
        sessionType: SessionType.REGULAR,
        status: 'SCHEDULED',
      },
    }),
    prisma.session.create({
      data: {
        title: 'Advanced Techniques',
        description: 'Advanced martial arts techniques and sparring',
        trainerId: trainerUser.id,
        organizationId: organization.id,
        startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
        capacity: 15,
        location: 'Training Hall',
        sessionType: SessionType.REGULAR,
        status: 'SCHEDULED',
      },
    }),
  ])

  console.log('Created test sessions:', sessions.length)

  // Create attendance records
  const attendanceRecords = await Promise.all([
    prisma.attendance.create({
      data: {
        sessionId: sessions[0].id,
        studentId: students[0].id,
        userId: trainerUser.id,
        status: 'PRESENT',
        checkInTime: new Date(),
      },
    }),
    prisma.attendance.create({
      data: {
        sessionId: sessions[0].id,
        studentId: students[1].id,
        userId: trainerUser.id,
        status: 'PRESENT',
        checkInTime: new Date(),
      },
    }),
  ])

  console.log('Created attendance records:', attendanceRecords.length)

  // Create payment records
  const payments = await Promise.all([
    prisma.payment.create({
      data: {
        studentId: students[0].id,
        amount: 100.00,
        paymentType: 'TUITION',
        paymentMethod: 'CASH',
        status: PaymentStatus.PAID,
        dueDate: new Date(),
        paidDate: new Date(),
        notes: 'Monthly tuition payment',
      },
    }),
    prisma.payment.create({
      data: {
        studentId: students[1].id,
        amount: 150.00,
        paymentType: 'PRIVATE_LESSON',
        paymentMethod: 'CARD',
        status: PaymentStatus.PAID,
        dueDate: new Date(),
        paidDate: new Date(),
        notes: 'Private lesson fee',
      },
    }),
  ])

  console.log('Created payment records:', payments.length)

  console.log('Database seeding completed successfully!')
  console.log('\nTest Account Credentials:')
  console.log('Admin: admin@test.com / admin123')
  console.log('Trainer: trainer@test.com / trainer123')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
