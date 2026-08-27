/**
 * Rich demo seed for local/dev testing.
 * Usage: cd server && npm run seed
 * Password for every demo account: Demo1234!
 */
import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { User } from '../models/User.js'
import { Organization } from '../models/Organization.js'
import { Membership } from '../models/Membership.js'
import { Course } from '../models/Course.js'
import { Subject } from '../models/Subject.js'
import { Topic } from '../models/Topic.js'
import { Lesson } from '../models/Lesson.js'
import { LessonProgress } from '../models/LessonProgress.js'
import { QuestionBank } from '../models/QuestionBank.js'
import { Question } from '../models/Question.js'
import { Exam } from '../models/Exam.js'
import { ExamAttempt } from '../models/ExamAttempt.js'
import { Certificate } from '../models/Certificate.js'
import { Notification } from '../models/Notification.js'
import { ActivityLog } from '../models/ActivityLog.js'
import { OrgInvite } from '../models/OrgInvite.js'

const MONGO =
  process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/examflow'
const PASSWORD = 'Demo1234!'
const SLUG = 'demo-academy'

type QType = 'mcq_single' | 'mcq_multiple' | 'true_false' | 'short_answer'

async function main() {
  console.log('Connecting…', MONGO.replace(/:\/\/.*@/, '://***@'))
  await mongoose.connect(MONGO)
  const passwordHash = await bcrypt.hash(PASSWORD, 10)

  const existingOrg = await Organization.findOne({ slug: SLUG })
  if (existingOrg) {
    const orgId = existingOrg._id
    await Promise.all([
      Membership.deleteMany({ organizationId: orgId }),
      Course.deleteMany({ organizationId: orgId }),
      Subject.deleteMany({ organizationId: orgId }),
      Topic.deleteMany({ organizationId: orgId }),
      Lesson.deleteMany({ organizationId: orgId }),
      LessonProgress.deleteMany({ organizationId: orgId }),
      QuestionBank.deleteMany({ organizationId: orgId }),
      Question.deleteMany({ organizationId: orgId }),
      Exam.deleteMany({ organizationId: orgId }),
      ExamAttempt.deleteMany({ organizationId: orgId }),
      Certificate.deleteMany({ organizationId: orgId }),
      Notification.deleteMany({ organizationId: orgId }),
      ActivityLog.deleteMany({ organizationId: orgId }),
      OrgInvite.deleteMany({ organizationId: orgId }),
    ])
    await Organization.deleteOne({ _id: orgId })
    console.log('Cleared previous Demo Academy data')
  }

  async function upsertUser(
    email: string,
    firstName: string,
    lastName: string,
    role: 'super_admin' | 'org_owner' | 'teacher' | 'examiner' | 'student'
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
    } else {
      u.firstName = firstName
      u.lastName = lastName
      u.role = role
      u.isEmailVerified = true
      u.isActive = true
      u.password = passwordHash
      await u.save()
    }
    return u
  }

  // Platform super-admin account (used for demo login)
  await upsertUser('admin@demo.examflow', 'Sara', 'Admin', 'super_admin')
  const owner = await upsertUser('owner@demo.examflow', 'Omar', 'Hassan', 'org_owner')

  const teacherSpecs = [
    ['teacher@demo.examflow', 'Lina', 'Farouk'],
    ['teacher2@demo.examflow', 'Karim', 'Nabil'],
    ['teacher3@demo.examflow', 'Nour', 'Adel'],
    ['teacher4@demo.examflow', 'Hany', 'Mostafa'],
    ['teacher5@demo.examflow', 'Dina', 'Youssef'],
  ] as const
  const teachers = []
  for (const [email, fn, ln] of teacherSpecs) {
    teachers.push(await upsertUser(email, fn, ln, 'teacher'))
  }

  const examinerSpecs = [
    ['examiner1@demo.examflow', 'Mona', 'Sami'],
    ['examiner2@demo.examflow', 'Tarek', 'Fouad'],
    ['examiner3@demo.examflow', 'Heba', 'Lotfy'],
    ['examiner4@demo.examflow', 'Ali', 'Mansour'],
    ['examiner5@demo.examflow', 'Rania', 'Sherif'],
  ] as const
  const examiners = []
  for (const [email, fn, ln] of examinerSpecs) {
    examiners.push(await upsertUser(email, fn, ln, 'examiner'))
  }

  const studentSpecs = [
    ['student@demo.examflow', 'Youssef', 'Ibrahim'],
    ['student2@demo.examflow', 'Salma', 'Mahmoud'],
    ['student3@demo.examflow', 'Ahmed', 'Kamal'],
    ['student4@demo.examflow', 'Farah', 'Zaki'],
    ['student5@demo.examflow', 'Omar', 'Taha'],
    ['student6@demo.examflow', 'Layla', 'Hatem'],
    ['student7@demo.examflow', 'Ziad', 'Osman'],
    ['student8@demo.examflow', 'Malak', 'Refaat'],
  ] as const
  const students = []
  for (const [email, fn, ln] of studentSpecs) {
    students.push(await upsertUser(email, fn, ln, 'student'))
  }

  const org = await Organization.create({
    name: 'Demo Academy',
    slug: SLUG,
    description: 'أكاديمية تجريبية غنية بالبيانات لاختبار ExamFlow',
    ownerId: owner.id,
    plan: 'professional',
    isActive: true,
    branding: { logoUrl: null, primaryColor: '#0f766e' },
  })

  await Membership.create({ organizationId: org.id, userId: owner.id, role: 'owner', status: 'active' })
  for (const t of teachers) {
    await Membership.create({
      organizationId: org.id,
      userId: t.id,
      role: 'teacher',
      status: 'active',
      invitedBy: owner.id,
    })
  }
  for (const e of examiners) {
    await Membership.create({
      organizationId: org.id,
      userId: e.id,
      role: 'examiner',
      status: 'active',
      invitedBy: owner.id,
    })
  }
  for (const s of students) {
    await Membership.create({
      organizationId: org.id,
      userId: s.id,
      role: 'student',
      status: 'active',
      invitedBy: teachers[0]!.id,
    })
  }

  const courseDefs = [
    { title: 'Intro Math', code: 'MATH-101', description: 'أساسيات الحساب والجبر' },
    { title: 'Algebra', code: 'MATH-201', description: 'المعادلات والدوال' },
    { title: 'Physics', code: 'PHY-101', description: 'الحركة والقوى والطاقة' },
    { title: 'Chemistry', code: 'CHE-101', description: 'الذرة والتفاعلات' },
    { title: 'English', code: 'ENG-101', description: 'القواعد والقراءة' },
    { title: 'Computer Science', code: 'CS-101', description: 'مقدمة في البرمجة' },
  ]
  const courses = []
  for (const [i, c] of courseDefs.entries()) {
    courses.push(
      await Course.create({
        organizationId: org.id,
        title: c.title,
        code: c.code,
        description: c.description,
        isActive: true,
        createdBy: teachers[i % teachers.length]!.id,
      })
    )
  }

  const subjectDefs = [
    { course: 0, title: 'Arithmetic', code: 'ARITH' },
    { course: 0, title: 'Fractions', code: 'FRAC' },
    { course: 1, title: 'Linear Equations', code: 'LIN' },
    { course: 2, title: 'Mechanics', code: 'MECH' },
    { course: 3, title: 'Atomic Structure', code: 'ATOM' },
    { course: 4, title: 'Grammar', code: 'GRAM' },
    { course: 5, title: 'Programming Basics', code: 'PROG' },
  ]
  const subjects = []
  for (const [i, s] of subjectDefs.entries()) {
    subjects.push(
      await Subject.create({
        organizationId: org.id,
        courseId: courses[s.course]!.id,
        title: s.title,
        code: s.code,
        order: i,
        isActive: true,
        createdBy: teachers[0]!.id,
      })
    )
  }

  const topicDefs = [
    { subject: 0, title: 'Addition and subtraction' },
    { subject: 0, title: 'Multiplication' },
    { subject: 1, title: 'Equivalent fractions' },
    { subject: 2, title: 'Solving for x' },
    { subject: 3, title: 'Newton laws' },
    { subject: 4, title: 'Periodic table' },
    { subject: 5, title: 'Tenses' },
    { subject: 6, title: 'Variables and types' },
  ]
  const topics = []
  for (const [i, tp] of topicDefs.entries()) {
    topics.push(
      await Topic.create({
        organizationId: org.id,
        subjectId: subjects[tp.subject]!.id,
        title: tp.title,
        order: i,
        isActive: true,
        createdBy: teachers[0]!.id,
      })
    )
  }

  const lessonBodies = [
    'Learn how to add and subtract whole numbers with examples.',
    'Multiplication as repeated addition, times tables, and word problems.',
    'How equivalent fractions represent the same value.',
    'Isolate the variable to solve linear equations.',
    'Force, mass, and acceleration: F = m a.',
    'How elements are arranged and what groups mean.',
    'Present simple vs present continuous with examples.',
    'Numbers, strings, booleans, and why types matter.',
  ]
  const lessons = []
  for (const [i, topic] of topics.entries()) {
    lessons.push(
      await Lesson.create({
        organizationId: org.id,
        topicId: topic.id,
        title: `Lesson ${i + 1}: ${topic.title}`,
        content: lessonBodies[i] || 'Lesson content',
        durationMinutes: 20 + i * 5,
        order: 0,
        isActive: true,
        createdBy: teachers[0]!.id,
      })
    )
  }

  const bankDefs = [
    { name: 'Math Basics', course: 0, desc: 'حساب' },
    { name: 'Algebra Bank', course: 1, desc: 'جبر' },
    { name: 'Physics Bank', course: 2, desc: 'فيزياء' },
    { name: 'Chemistry Bank', course: 3, desc: 'كيمياء' },
    { name: 'English Bank', course: 4, desc: 'لغة إنجليزية' },
    { name: 'CS Bank', course: 5, desc: 'علوم حاسب' },
  ]
  const banks = []
  for (const [i, b] of bankDefs.entries()) {
    banks.push(
      await QuestionBank.create({
        organizationId: org.id,
        courseId: courses[b.course]!.id,
        name: b.name,
        description: b.desc,
        questionCount: 0,
        createdBy: teachers[i % teachers.length]!.id,
      })
    )
  }

  type QDef = {
    bank: number
    type: QType
    stem: string
    options?: { id: string; text: string }[]
    correct: string[]
    difficulty: 'easy' | 'medium' | 'hard'
    points: number
  }

  const qdefs: QDef[] = [
    { bank: 0, type: 'mcq_single', stem: 'What is 2 + 2?', options: [{ id: 'a', text: '3' }, { id: 'b', text: '4' }, { id: 'c', text: '5' }], correct: ['b'], difficulty: 'easy', points: 1 },
    { bank: 0, type: 'mcq_single', stem: 'What is 7 × 6?', options: [{ id: 'a', text: '42' }, { id: 'b', text: '36' }, { id: 'c', text: '48' }], correct: ['a'], difficulty: 'easy', points: 1 },
    { bank: 0, type: 'true_false', stem: 'Zero is an even number.', options: [{ id: 't', text: 'True' }, { id: 'f', text: 'False' }], correct: ['t'], difficulty: 'easy', points: 1 },
    { bank: 0, type: 'short_answer', stem: 'Write 1/2 as a decimal.', correct: ['0.5'], difficulty: 'medium', points: 2 },
    { bank: 1, type: 'mcq_single', stem: 'Solve: x + 5 = 12. x = ?', options: [{ id: 'a', text: '5' }, { id: 'b', text: '7' }, { id: 'c', text: '17' }], correct: ['b'], difficulty: 'easy', points: 1 },
    { bank: 1, type: 'mcq_multiple', stem: 'Which are linear?', options: [{ id: 'a', text: 'y = 2x + 1' }, { id: 'b', text: 'y = x²' }, { id: 'c', text: 'x + y = 4' }], correct: ['a', 'c'], difficulty: 'medium', points: 2 },
    { bank: 1, type: 'true_false', stem: 'A linear equation graphs as a straight line.', options: [{ id: 't', text: 'True' }, { id: 'f', text: 'False' }], correct: ['t'], difficulty: 'easy', points: 1 },
    { bank: 1, type: 'short_answer', stem: 'Solve 2x = 10. What is x?', correct: ['5'], difficulty: 'easy', points: 2 },
    { bank: 2, type: 'mcq_single', stem: 'SI unit of force?', options: [{ id: 'a', text: 'Joule' }, { id: 'b', text: 'Newton' }, { id: 'c', text: 'Watt' }], correct: ['b'], difficulty: 'easy', points: 1 },
    { bank: 2, type: 'true_false', stem: 'Mass and weight are the same quantity.', options: [{ id: 't', text: 'True' }, { id: 'f', text: 'False' }], correct: ['f'], difficulty: 'easy', points: 1 },
    { bank: 2, type: 'mcq_single', stem: 'Acceleration due to gravity on Earth is about', options: [{ id: 'a', text: '9.8 m/s²' }, { id: 'b', text: '3×10⁸ m/s' }, { id: 'c', text: '100 N' }], correct: ['a'], difficulty: 'medium', points: 1 },
    { bank: 2, type: 'short_answer', stem: 'State Newton’s second law in words.', correct: ['F=ma'], difficulty: 'medium', points: 3 },
    { bank: 3, type: 'mcq_single', stem: 'Atomic number of carbon?', options: [{ id: 'a', text: '6' }, { id: 'b', text: '12' }, { id: 'c', text: '8' }], correct: ['a'], difficulty: 'easy', points: 1 },
    { bank: 3, type: 'true_false', stem: 'Water is H2O.', options: [{ id: 't', text: 'True' }, { id: 'f', text: 'False' }], correct: ['t'], difficulty: 'easy', points: 1 },
    { bank: 3, type: 'mcq_single', stem: 'NaCl is commonly', options: [{ id: 'a', text: 'Sugar' }, { id: 'b', text: 'Table salt' }, { id: 'c', text: 'Vinegar' }], correct: ['b'], difficulty: 'easy', points: 1 },
    { bank: 3, type: 'short_answer', stem: 'What is the chemical symbol for gold?', correct: ['Au'], difficulty: 'medium', points: 2 },
    { bank: 4, type: 'mcq_single', stem: 'Choose the correct form: She ____ to school.', options: [{ id: 'a', text: 'go' }, { id: 'b', text: 'goes' }, { id: 'c', text: 'going' }], correct: ['b'], difficulty: 'easy', points: 1 },
    { bank: 4, type: 'true_false', stem: '"I am reading" is present continuous.', options: [{ id: 't', text: 'True' }, { id: 'f', text: 'False' }], correct: ['t'], difficulty: 'easy', points: 1 },
    { bank: 4, type: 'mcq_single', stem: 'Antonym of "hot"?', options: [{ id: 'a', text: 'cold' }, { id: 'b', text: 'warm' }, { id: 'c', text: 'heat' }], correct: ['a'], difficulty: 'easy', points: 1 },
    { bank: 4, type: 'short_answer', stem: 'Write the past tense of "go".', correct: ['went'], difficulty: 'easy', points: 2 },
    { bank: 5, type: 'mcq_single', stem: 'Which is a boolean value?', options: [{ id: 'a', text: 'true' }, { id: 'b', text: '"true"' }, { id: 'c', text: '3' }], correct: ['a'], difficulty: 'easy', points: 1 },
    { bank: 5, type: 'true_false', stem: 'HTML is a programming language.', options: [{ id: 't', text: 'True' }, { id: 'f', text: 'False' }], correct: ['f'], difficulty: 'medium', points: 1 },
    { bank: 5, type: 'mcq_single', stem: 'Binary of decimal 2 is', options: [{ id: 'a', text: '10' }, { id: 'b', text: '11' }, { id: 'c', text: '01' }], correct: ['a'], difficulty: 'medium', points: 1 },
    { bank: 5, type: 'short_answer', stem: 'What does CPU stand for?', correct: ['Central Processing Unit'], difficulty: 'easy', points: 2 },
  ]

  const questionsByBank: string[][] = banks.map(() => [])
  const questionDocs: { id: string; bank: number; def: QDef }[] = []
  for (const def of qdefs) {
    const q = await Question.create({
      organizationId: org.id,
      bankId: banks[def.bank]!.id,
      type: def.type,
      stem: def.stem,
      options: def.options ?? [],
      correctAnswers: def.correct,
      difficulty: def.difficulty,
      tags: [bankDefs[def.bank]!.name.toLowerCase()],
      points: def.points,
      isActive: true,
      createdBy: teachers[def.bank % teachers.length]!.id,
    })
    questionsByBank[def.bank]!.push(q.id)
    questionDocs.push({ id: q.id, bank: def.bank, def })
  }
  for (const [i, bank] of banks.entries()) {
    bank.questionCount = questionsByBank[i]!.length
    await bank.save()
  }

  const examDefs = [
    { title: 'Math Placement Quiz', desc: 'حساب أساسي', bank: 0, status: 'published' as const, minutes: 20, pass: 50 },
    { title: 'Algebra Midterm', desc: 'اختبار منتصف الجبر', bank: 1, status: 'published' as const, minutes: 30, pass: 60 },
    { title: 'Physics Checkpoint', desc: 'ميكانيكا', bank: 2, status: 'published' as const, minutes: 25, pass: 50 },
    { title: 'Chemistry Basics', desc: 'الذرة والمركبات', bank: 3, status: 'published' as const, minutes: 20, pass: 50 },
    { title: 'English Skills Test', desc: 'قواعد ومفردات', bank: 4, status: 'published' as const, minutes: 15, pass: 50 },
    { title: 'CS Intro Exam', desc: 'مسودة اختبار الحاسب', bank: 5, status: 'draft' as const, minutes: 40, pass: 70 },
  ]
  const exams = []
  for (const [i, e] of examDefs.entries()) {
    const qids = questionsByBank[e.bank]!
    const totalPoints = qdefs.filter((q) => q.bank === e.bank).reduce((s, q) => s + q.points, 0)
    exams.push(
      await Exam.create({
        organizationId: org.id,
        title: e.title,
        description: e.desc,
        status: e.status,
        questionIds: qids,
        timeLimitMinutes: e.minutes,
        passingScorePercent: e.pass,
        shuffleQuestions: false,
        shuffleOptions: false,
        maxAttempts: 3,
        totalPoints,
        createdBy: teachers[i % teachers.length]!.id,
      })
    )
  }

  function snapshotForBank(bankIndex: number) {
    return questionDocs
      .filter((q) => q.bank === bankIndex)
      .map((q) => ({
        id: q.id,
        type: q.def.type,
        stem: q.def.stem,
        options: q.def.options ?? [],
        points: q.def.points,
        difficulty: q.def.difficulty,
        correctAnswers: q.def.correct,
      }))
  }

  function grade(snapshot: ReturnType<typeof snapshotForBank>, answers: { questionId: string; selected: string[] }[]) {
    let score = 0
    let pending = 0
    const maxScore = snapshot.reduce((s, q) => s + q.points, 0)
    for (const q of snapshot) {
      const ans = answers.find((a) => a.questionId === q.id)
      const selected = ans?.selected ?? []
      if (q.type === 'short_answer') {
        if (selected.some((s) => s.trim())) pending += 1
        continue
      }
      const a = [...selected].sort().join('|')
      const b = [...q.correctAnswers].sort().join('|')
      if (a && a === b) score += q.points
    }
    const percent = maxScore > 0 ? Math.round((score / maxScore) * 1000) / 10 : 0
    return { score, maxScore, percent, pending }
  }

  const publishedExams = exams.filter((e) => e.status === 'published')
  let certCount = 0
  const now = Date.now()

  for (const [si, student] of students.entries()) {
    const exam = publishedExams[si % publishedExams.length]!
    const bankIndex = examDefs.findIndex((d) => d.title === exam.title)
    const snap = snapshotForBank(bankIndex)
    const answers = snap.map((q) => {
      if (q.type === 'short_answer') {
        const write = si % 3 !== 2
        return { questionId: q.id, selected: write ? [q.correctAnswers[0] || 'answer'] : [] }
      }
      const correct = si % 4 !== 3
      return { questionId: q.id, selected: correct ? [...q.correctAnswers] : [] }
    })
    const g = grade(snap, answers)
    const passed = g.percent >= (exam.passingScorePercent || 50) && g.pending === 0
    const startedAt = new Date(now - (si + 1) * 3600_000)
    const submittedAt = new Date(startedAt.getTime() + 12 * 60_000)
    const attempt = await ExamAttempt.create({
      examId: exam.id,
      organizationId: org.id,
      userId: student.id,
      status: 'submitted',
      startedAt,
      submittedAt,
      answers,
      questionSnapshot: snap,
      score: g.score,
      maxScore: g.maxScore,
      percent: g.percent,
      passed,
      needsManualGrading: g.pending > 0,
      focusLossCount: si % 2,
      tabSwitchCount: si % 3,
      pasteCount: 0,
      securityEvents: [],
    })

    if (passed && certCount < 8) {
      const code = `DEMO${String(certCount + 1).padStart(4, '0')}`
      await Certificate.create({
        organizationId: org.id,
        examId: exam.id,
        attemptId: attempt.id,
        userId: student.id,
        code,
        recipientName: `${student.firstName} ${student.lastName}`,
        examTitle: exam.title,
        score: g.score,
        maxScore: g.maxScore,
        percent: g.percent,
        issuedAt: submittedAt,
      })
      certCount += 1
      await Notification.create({
        userId: student.id,
        organizationId: org.id,
        type: 'certificate_issued',
        title: 'Certificate issued',
        body: `Your certificate for ${exam.title} is ready.`,
        link: `/app/organizations/${org.id}/certificates`,
      })
    } else if (g.pending > 0) {
      await Notification.create({
        userId: examiners[0]!.id,
        organizationId: org.id,
        type: 'grading_needed',
        title: 'Grading needed',
        body: `${student.firstName} submitted ${exam.title} with short answers.`,
        link: `/app/organizations/${org.id}/grading`,
      })
    } else {
      await Notification.create({
        userId: student.id,
        organizationId: org.id,
        type: 'result_ready',
        title: 'Result ready',
        body: `Your result for ${exam.title} is ${g.percent}%.`,
        link: `/app/organizations/${org.id}/exams`,
      })
    }
  }

  for (const [i, lesson] of lessons.entries()) {
    const student = students[i % students.length]!
    await LessonProgress.create({
      organizationId: org.id,
      lessonId: lesson.id,
      userId: student.id,
      status: i % 2 === 0 ? 'completed' : 'viewed',
      viewedAt: new Date(),
      completedAt: i % 2 === 0 ? new Date() : null,
    })
  }

  await ActivityLog.create([
    { organizationId: org.id, actorId: owner.id, action: 'org.updated', summary: 'Organization branding updated', entityType: 'organization', entityId: org.id },
    { organizationId: org.id, actorId: owner.id, action: 'member.invited', summary: 'Invited teachers and students', entityType: 'membership' },
    { organizationId: org.id, actorId: teachers[0]!.id, action: 'exam.created', summary: 'Created Math Placement Quiz', entityType: 'exam', entityId: exams[0]!.id },
    { organizationId: org.id, actorId: teachers[0]!.id, action: 'exam.published', summary: 'Published Math Placement Quiz', entityType: 'exam', entityId: exams[0]!.id },
    { organizationId: org.id, actorId: teachers[1]!.id, action: 'exam.published', summary: 'Published Algebra Midterm', entityType: 'exam', entityId: exams[1]!.id },
    { organizationId: org.id, actorId: owner.id, action: 'member.role_changed', summary: 'Assigned examiner roles', entityType: 'membership' },
  ])

  for (const exam of publishedExams) {
    for (const s of students.slice(0, 3)) {
      await Notification.create({
        userId: s.id,
        organizationId: org.id,
        type: 'exam_published',
        title: 'New exam published',
        body: `${exam.title} is now available.`,
        link: `/app/organizations/${org.id}/exams`,
      })
    }
  }

  console.log('\n✅ Seed complete — Demo Academy')
  console.log(`Password for all accounts: ${PASSWORD}`)
  console.log('Platform admin: admin@demo.examflow')
  console.log('Owner:          owner@demo.examflow')
  console.log('Teachers:       teacher@demo.examflow … teacher5@demo.examflow')
  console.log('Examiners:      examiner1@demo.examflow … examiner5@demo.examflow')
  console.log('Students:       student@demo.examflow … student8@demo.examflow')
  console.log(`Org slug: ${SLUG}  | courses ${courses.length} | subjects ${subjects.length} | lessons ${lessons.length}`)
  console.log(`banks ${banks.length} | questions ${qdefs.length} | exams ${exams.length} | certificates ${certCount}`)

  await mongoose.disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
