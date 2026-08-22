import { randomUUID } from 'crypto'
import { Course } from '../models/Course.js'
import { QuestionBank } from '../models/QuestionBank.js'
import { Question } from '../models/Question.js'
import { AppError } from '../middlewares/errorHandler.js'
import type {
  CourseDTO,
  QuestionBankDTO,
  QuestionDTO,
  QuestionType,
  Difficulty,
} from '../types/content.js'

function toCourseDTO(c: InstanceType<typeof Course>): CourseDTO {
  return {
    id: c.id,
    organizationId: c.organizationId.toString(),
    title: c.title,
    code: c.code ?? null,
    description: c.description ?? null,
    isActive: c.isActive,
    createdBy: c.createdBy.toString(),
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }
}

function toBankDTO(b: InstanceType<typeof QuestionBank>): QuestionBankDTO {
  return {
    id: b.id,
    organizationId: b.organizationId.toString(),
    courseId: b.courseId?.toString() ?? null,
    name: b.name,
    description: b.description ?? null,
    questionCount: b.questionCount ?? 0,
    createdBy: b.createdBy.toString(),
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  }
}

function toQuestionDTO(q: InstanceType<typeof Question>): QuestionDTO {
  return {
    id: q.id,
    organizationId: q.organizationId.toString(),
    bankId: q.bankId.toString(),
    type: q.type,
    stem: q.stem,
    options: q.options?.map((o) => ({ id: o.id, text: o.text })) ?? [],
    correctAnswers: q.correctAnswers ?? [],
    difficulty: q.difficulty,
    tags: q.tags ?? [],
    points: q.points,
    version: q.version,
    isActive: q.isActive,
    createdBy: q.createdBy.toString(),
    createdAt: q.createdAt.toISOString(),
    updatedAt: q.updatedAt.toISOString(),
  }
}

export async function listCourses(orgId: string): Promise<CourseDTO[]> {
  const courses = await Course.find({ organizationId: orgId, isActive: true }).sort({
    createdAt: -1,
  })
  return courses.map(toCourseDTO)
}

export async function createCourse(
  orgId: string,
  userId: string,
  data: { title: string; code?: string; description?: string }
): Promise<CourseDTO> {
  const course = await Course.create({
    organizationId: orgId,
    title: data.title.trim(),
    code: data.code?.trim() || null,
    description: data.description?.trim() || null,
    createdBy: userId,
  })
  return toCourseDTO(course)
}

export async function updateCourse(
  orgId: string,
  courseId: string,
  data: { title?: string; code?: string | null; description?: string | null; isActive?: boolean }
): Promise<CourseDTO> {
  const course = await Course.findOne({ _id: courseId, organizationId: orgId })
  if (!course) throw new AppError('Course not found', 404, 'COURSE_NOT_FOUND')
  if (data.title !== undefined) course.title = data.title.trim()
  if (data.code !== undefined) course.code = data.code
  if (data.description !== undefined) course.description = data.description
  if (data.isActive !== undefined) course.isActive = data.isActive
  await course.save()
  return toCourseDTO(course)
}

export async function deleteCourse(orgId: string, courseId: string): Promise<void> {
  const course = await Course.findOne({ _id: courseId, organizationId: orgId })
  if (!course) throw new AppError('Course not found', 404, 'COURSE_NOT_FOUND')
  course.isActive = false
  await course.save()
}

export async function listBanks(
  orgId: string,
  courseId?: string
): Promise<QuestionBankDTO[]> {
  const filter: Record<string, unknown> = { organizationId: orgId }
  if (courseId) filter.courseId = courseId
  const banks = await QuestionBank.find(filter).sort({ createdAt: -1 })
  return banks.map(toBankDTO)
}

export async function createBank(
  orgId: string,
  userId: string,
  data: { name: string; description?: string; courseId?: string }
): Promise<QuestionBankDTO> {
  if (data.courseId) {
    const course = await Course.findOne({
      _id: data.courseId,
      organizationId: orgId,
      isActive: true,
    })
    if (!course) throw new AppError('Course not found', 404, 'COURSE_NOT_FOUND')
  }
  const bank = await QuestionBank.create({
    organizationId: orgId,
    courseId: data.courseId || null,
    name: data.name.trim(),
    description: data.description?.trim() || null,
    createdBy: userId,
    questionCount: 0,
  })
  return toBankDTO(bank)
}

export async function getBank(orgId: string, bankId: string): Promise<QuestionBankDTO> {
  const bank = await QuestionBank.findOne({ _id: bankId, organizationId: orgId })
  if (!bank) throw new AppError('Question bank not found', 404, 'BANK_NOT_FOUND')
  return toBankDTO(bank)
}

export async function updateBank(
  orgId: string,
  bankId: string,
  data: { name?: string; description?: string | null; courseId?: string | null }
): Promise<QuestionBankDTO> {
  const bank = await QuestionBank.findOne({ _id: bankId, organizationId: orgId })
  if (!bank) throw new AppError('Question bank not found', 404, 'BANK_NOT_FOUND')
  if (data.name !== undefined) bank.name = data.name.trim()
  if (data.description !== undefined) bank.description = data.description
  if (data.courseId !== undefined) bank.courseId = data.courseId as any
  await bank.save()
  return toBankDTO(bank)
}

export async function deleteBank(orgId: string, bankId: string): Promise<void> {
  const bank = await QuestionBank.findOne({ _id: bankId, organizationId: orgId })
  if (!bank) throw new AppError('Question bank not found', 404, 'BANK_NOT_FOUND')
  await Question.deleteMany({ bankId, organizationId: orgId })
  await bank.deleteOne()
}

function validateQuestionPayload(data: {
  type: QuestionType
  stem: string
  options?: { id?: string; text: string }[]
  correctAnswers?: string[]
}) {
  if (!data.stem?.trim()) throw new AppError('Question stem is required', 400, 'INVALID_STEM')
  if (data.type === 'mcq_single' || data.type === 'mcq_multiple') {
    const opts = data.options ?? []
    if (opts.length < 2) {
      throw new AppError('MCQ requires at least 2 options', 400, 'INVALID_OPTIONS')
    }
    const answers = data.correctAnswers ?? []
    if (answers.length === 0) {
      throw new AppError('At least one correct answer is required', 400, 'INVALID_ANSWERS')
    }
    if (data.type === 'mcq_single' && answers.length !== 1) {
      throw new AppError('Single MCQ must have exactly one correct answer', 400, 'INVALID_ANSWERS')
    }
  }
  if (data.type === 'true_false') {
    const answers = data.correctAnswers ?? []
    if (answers.length !== 1 || !['true', 'false'].includes(answers[0]!)) {
      throw new AppError(
        'True/False requires correctAnswers: ["true"] or ["false"]',
        400,
        'INVALID_ANSWERS'
      )
    }
  }
}

export async function listQuestions(
  orgId: string,
  bankId: string
): Promise<QuestionDTO[]> {
  const bank = await QuestionBank.findOne({ _id: bankId, organizationId: orgId })
  if (!bank) throw new AppError('Question bank not found', 404, 'BANK_NOT_FOUND')
  const questions = await Question.find({
    organizationId: orgId,
    bankId,
    isActive: true,
  }).sort({ createdAt: -1 })
  return questions.map(toQuestionDTO)
}

export async function createQuestion(
  orgId: string,
  userId: string,
  bankId: string,
  data: {
    type: QuestionType
    stem: string
    options?: { text: string }[]
    correctAnswers?: string[]
    difficulty?: Difficulty
    tags?: string[]
    points?: number
  }
): Promise<QuestionDTO> {
  const bank = await QuestionBank.findOne({ _id: bankId, organizationId: orgId })
  if (!bank) throw new AppError('Question bank not found', 404, 'BANK_NOT_FOUND')
  validateQuestionPayload(data)

  let options: { id: string; text: string }[] = []
  let correctAnswers = data.correctAnswers ?? []

  if (data.type === 'true_false') {
    options = [
      { id: 'true', text: 'True' },
      { id: 'false', text: 'False' },
    ]
  } else if (data.type === 'mcq_single' || data.type === 'mcq_multiple') {
    options = (data.options ?? []).map((o) => ({
      id: randomUUID().slice(0, 8),
      text: o.text.trim(),
    }))
    correctAnswers = (data.correctAnswers ?? []).map((a) => {
      const idx = Number(a)
      if (!Number.isNaN(idx) && options[idx]) return options[idx]!.id
      return a
    })
  }

  const question = await Question.create({
    organizationId: orgId,
    bankId,
    type: data.type,
    stem: data.stem.trim(),
    options,
    correctAnswers,
    difficulty: data.difficulty ?? 'medium',
    tags: data.tags ?? [],
    points: data.points ?? 1,
    createdBy: userId,
  })

  bank.questionCount = (bank.questionCount ?? 0) + 1
  await bank.save()
  return toQuestionDTO(question)
}

export async function updateQuestion(
  orgId: string,
  questionId: string,
  data: {
    stem?: string
    options?: { id?: string; text: string }[]
    correctAnswers?: string[]
    difficulty?: Difficulty
    tags?: string[]
    points?: number
    isActive?: boolean
  }
): Promise<QuestionDTO> {
  const question = await Question.findOne({ _id: questionId, organizationId: orgId })
  if (!question) throw new AppError('Question not found', 404, 'QUESTION_NOT_FOUND')
  if (data.stem !== undefined) question.stem = data.stem.trim()
  if (data.difficulty !== undefined) question.difficulty = data.difficulty
  if (data.tags !== undefined) question.tags = data.tags
  if (data.points !== undefined) question.points = data.points
  if (data.isActive !== undefined) question.isActive = data.isActive
  if (data.options !== undefined) {
    question.options = data.options.map((o) => ({
      id: o.id || randomUUID().slice(0, 8),
      text: o.text.trim(),
    }))
  }
  if (data.correctAnswers !== undefined) question.correctAnswers = data.correctAnswers
  question.version += 1
  await question.save()
  return toQuestionDTO(question)
}

export async function deleteQuestion(
  orgId: string,
  questionId: string
): Promise<void> {
  const question = await Question.findOne({ _id: questionId, organizationId: orgId })
  if (!question) throw new AppError('Question not found', 404, 'QUESTION_NOT_FOUND')
  question.isActive = false
  await question.save()
  await QuestionBank.updateOne(
    { _id: question.bankId, organizationId: orgId, questionCount: { $gt: 0 } },
    { $inc: { questionCount: -1 } }
  )
}

// Re-export hierarchy APIs
export {
  listSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  listTopics,
  createTopic,
  updateTopic,
  deleteTopic,
  listLessons,
  createLesson,
  updateLesson,
  deleteLesson,
} from './content.hierarchy.js'
