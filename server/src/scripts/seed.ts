/**
 * Demo seed for local/dev.
 * Usage: cd server && npx tsx src/scripts/seed.ts
 * Requires DATABASE_URL in env.
 */
import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { Organization } from '../models/Organization.js'
import { Membership } from '../models/Membership.js'
import { Course } from '../models/Course.js'
import { QuestionBank } from '../models/QuestionBank.js'
import { Question } from '../models/Question.js'
import { Exam } from '../models/Exam.js'

const MONGO = process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/examflow'

async function main() {
  console.log('Connecting…', MONGO.replace(/:\/\/.*@/, '://***@'))
  await mongoose.connect(MONGO)

  const passwordHash = await bcrypt.hash('Demo1234!', 10)

  async function upsertUser(
    email: string,
    firstName: string,
    lastName: string,
    role: 'org_owner' | 'teacher' | 'student'
  ) {
    let u = await User.findOne({ email })
    if (!u) {
      u = await User.create({
        email,
        password: passwordHash,
        firstName,
        lastName,
        role,
        isEmailVerified: true,
        isActive: true,
      })
      console.log('Created user', email)
    } else {
      console.log('User exists', email)
    }
    return u
  }

  const owner = await upsertUser('owner@demo.examflow', 'Demo', 'Owner', 'org_owner')
  const teacher = await upsertUser('teacher@demo.examflow', 'Demo', 'Teacher', 'teacher')
  const student = await upsertUser('student@demo.examflow', 'Demo', 'Student', 'student')

  let org = await Organization.findOne({ slug: 'demo-academy' })
  if (!org) {
    org = await Organization.create({
      name: 'Demo Academy',
      slug: 'demo-academy',
      description: 'Seeded demo organization for ExamFlow',
      ownerId: owner.id,
      plan: 'professional',
      branding: { logoUrl: null, primaryColor: '#0f766e' },
    })
    console.log('Created org Demo Academy')
  }

  async function ensureMembership(
    userId: string,
    role: 'owner' | 'teacher' | 'student'
  ) {
    const existing = await Membership.findOne({ organizationId: org!.id, userId })
    if (!existing) {
      await Membership.create({
        organizationId: org!.id,
        userId,
        role,
        status: 'active',
      })
      console.log('Membership', role, userId)
    }
  }

  await ensureMembership(owner.id, 'owner')
  await ensureMembership(teacher.id, 'teacher')
  await ensureMembership(student.id, 'student')

  let course = await Course.findOne({ organizationId: org.id, title: 'Intro Math' })
  if (!course) {
    course = await Course.create({
      organizationId: org.id,
      title: 'Intro Math',
      code: 'MATH-101',
      description: 'Demo course',
      isActive: true,
      createdBy: owner.id,
    })
  }

 let bank = await QuestionBank.findOne({
  organizationId: org.id,
  name: 'Math Basics',
})

if (!bank) {
  bank = await QuestionBank.create({
    organizationId: org.id,
    name: 'Math Basics',
    description: 'Demo bank',
    createdBy: owner.id,
  })

  console.log('Created Question Bank Math Basics')
}

  const qCount = await Question.countDocuments({ organizationId: org.id, bankId: bank.id })
  if (qCount === 0) {
    const q1 = await Question.create({
      organizationId: org.id,
      bankId: bank.id,
      type: 'mcq_single',
      stem: 'What is 2 + 2?',
      options: [
        { id: 'a', text: '3' },
        { id: 'b', text: '4' },
        { id: 'c', text: '5' },
      ],
      correctAnswers: ['b'],
      difficulty: 'easy',
      tags: ['arithmetic'],
      points: 1,
      isActive: true,
      createdBy: teacher.id,
    })
    const q2 = await Question.create({
      organizationId: org.id,
      bankId: bank.id,
      type: 'true_false',
      stem: 'The earth is flat.',
      options: [
        { id: 't', text: 'True' },
        { id: 'f', text: 'False' },
      ],
      correctAnswers: ['f'],
      difficulty: 'easy',
      tags: ['science'],
      points: 1,
      isActive: true,
      createdBy: teacher.id,
    })

    const examExists = await Exam.findOne({ organizationId: org.id, title: 'Demo Quiz' })
    if (!examExists) {
      await Exam.create({
        organizationId: org.id,
        title: 'Demo Quiz',
        description: 'Seeded quiz',
        status: 'published',
        questionIds: [q1.id, q2.id],
        timeLimitMinutes: 15,
        passingScorePercent: 50,
        createdBy: teacher.id,
      })
      console.log('Created Demo Quiz')
    }
  }

  console.log('\n✅ Seed complete')
  console.log('Login accounts (password: Demo1234!):')
  console.log('  owner@demo.examflow')
  console.log('  teacher@demo.examflow')
  console.log('  student@demo.examflow')
  console.log('Org slug: demo-academy')

  await mongoose.disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
