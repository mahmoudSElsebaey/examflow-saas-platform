import { Exam } from '../models/Exam.js'
import { ExamAttempt } from '../models/ExamAttempt.js'
import { Question } from '../models/Question.js'
import { AppError } from '../middlewares/errorHandler.js'
import type {
  ExamDTO,
  ExamAttemptDTO,
  AttemptQuestionView,
  AttemptReviewSummary,
} from '../types/exam.js'
import * as certService from './certificate.service.js'
import { Certificate } from '../models/Certificate.js'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

function toExamDTO(e: InstanceType<typeof Exam>): ExamDTO {
  return {
    id: e.id,
    organizationId: e.organizationId.toString(),
    title: e.title,
    description: e.description ?? null,
    status: e.status,
    questionIds: (e.questionIds || []).map((id) => id.toString()),
    timeLimitMinutes: e.timeLimitMinutes ?? null,
    passingScorePercent: e.passingScorePercent,
    shuffleQuestions: e.shuffleQuestions,
    shuffleOptions: e.shuffleOptions,
    maxAttempts: e.maxAttempts,
    totalPoints: e.totalPoints ?? 0,
    questionCount: (e.questionIds || []).length,
    createdBy: e.createdBy.toString(),
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  }
}

function arraysEqualAsSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  const sa = new Set(a)
  return b.every((x) => sa.has(x))
}

function toAttemptDTO(
  a: InstanceType<typeof ExamAttempt>,
  opts?: {
    includeQuestions?: boolean
    examTitle?: string
    certificateId?: string | null
    certificateCode?: string | null
  }
): ExamAttemptDTO {
  const closed = a.status === 'submitted' || a.status === 'timed_out'
  let review: AttemptReviewSummary | undefined
  let questions: AttemptQuestionView[] | undefined

  if (opts?.includeQuestions) {
    let correctCount = 0
    let wrongCount = 0
    let skippedCount = 0
    let pendingManualCount = 0

    questions = (a.questionSnapshot || []).map((q) => {
      const selected =
        a.answers?.find((x) => x.questionId === q.id)?.selected ?? []
      const base: AttemptQuestionView = {
        id: q.id,
        type: q.type,
        stem: q.stem,
        options: q.options?.map((o) => ({ id: o.id, text: o.text })) ?? [],
        points: q.points,
        difficulty: q.difficulty,
      }

      if (!closed) return base

      const correct = q.correctAnswers || []
      let outcome: AttemptQuestionView['outcome']
      let pointsEarned = 0

      if (q.type === 'short_answer') {
        outcome = selected.some((s) => s.trim().length > 0)
          ? 'pending_manual'
          : 'skipped'
        if (outcome === 'pending_manual') pendingManualCount++
        else skippedCount++
      } else if (selected.length === 0) {
        outcome = 'skipped'
        skippedCount++
      } else if (arraysEqualAsSet(selected, correct)) {
        outcome = 'correct'
        pointsEarned = q.points || 0
        correctCount++
      } else {
        outcome = 'wrong'
        wrongCount++
      }

      return {
        ...base,
        correctAnswers: correct,
        userSelected: selected,
        outcome,
        pointsEarned,
      }
    })

    const started = a.startedAt ? new Date(a.startedAt).getTime() : null
    const ended = a.submittedAt ? new Date(a.submittedAt).getTime() : null
    const timeTakenSeconds =
      started != null && ended != null
        ? Math.max(0, Math.round((ended - started) / 1000))
        : null

    review = {
      correctCount,
      wrongCount,
      skippedCount,
      pendingManualCount,
      timeTakenSeconds,
    }
  }

  return {
    id: a.id,
    examId: a.examId.toString(),
    organizationId: a.organizationId.toString(),
    userId: a.userId.toString(),
    status: a.status,
    startedAt: a.startedAt.toISOString(),
    submittedAt: a.submittedAt?.toISOString() ?? null,
    expiresAt: a.expiresAt?.toISOString() ?? null,
    answers:
      a.answers?.map((x) => ({
        questionId: x.questionId,
        selected: x.selected ?? [],
      })) ?? [],
    score: a.score ?? null,
    maxScore: a.maxScore ?? null,
    percent: a.percent ?? null,
    passed: a.passed ?? null,
    questions,
    examTitle: opts?.examTitle,
    review,
    certificateId: opts?.certificateId ?? null,
    certificateCode: opts?.certificateCode ?? null,
  }
}

async function recalcTotalPoints(questionIds: string[]): Promise<number> {
  if (questionIds.length === 0) return 0
  const qs = await Question.find({ _id: { $in: questionIds }, isActive: true })
  return qs.reduce((sum, q) => sum + (q.points || 0), 0)
}

export async function listExams(orgId: string): Promise<ExamDTO[]> {
  const exams = await Exam.find({
    organizationId: orgId,
    status: { $ne: 'archived' },
  }).sort({ createdAt: -1 })
  return exams.map(toExamDTO)
}

export async function getExam(orgId: string, examId: string): Promise<ExamDTO> {
  const exam = await Exam.findOne({ _id: examId, organizationId: orgId })
  if (!exam || exam.status === 'archived') {
    throw new AppError('Exam not found', 404, 'EXAM_NOT_FOUND')
  }
  return toExamDTO(exam)
}

export async function createExam(
  orgId: string,
  userId: string,
  data: {
    title: string
    description?: string
    questionIds?: string[]
    timeLimitMinutes?: number | null
    passingScorePercent?: number
    shuffleQuestions?: boolean
    shuffleOptions?: boolean
    maxAttempts?: number
  }
): Promise<ExamDTO> {
  const questionIds = data.questionIds ?? []
  if (questionIds.length > 0) {
    const count = await Question.countDocuments({
      _id: { $in: questionIds },
      organizationId: orgId,
      isActive: true,
    })
    if (count !== questionIds.length) {
      throw new AppError(
        'Some questions are invalid for this organization',
        400,
        'INVALID_QUESTIONS'
      )
    }
  }

  const totalPoints = await recalcTotalPoints(questionIds)
  const exam = await Exam.create({
    organizationId: orgId,
    title: data.title.trim(),
    description: data.description?.trim() || null,
    questionIds,
    timeLimitMinutes: data.timeLimitMinutes ?? null,
    passingScorePercent: data.passingScorePercent ?? 50,
    shuffleQuestions: data.shuffleQuestions ?? true,
    shuffleOptions: data.shuffleOptions ?? true,
    maxAttempts: data.maxAttempts ?? 1,
    totalPoints,
    createdBy: userId,
    status: 'draft',
  })
  return toExamDTO(exam)
}

export async function updateExam(
  orgId: string,
  examId: string,
  data: {
    title?: string
    description?: string | null
    questionIds?: string[]
    timeLimitMinutes?: number | null
    passingScorePercent?: number
    shuffleQuestions?: boolean
    shuffleOptions?: boolean
    maxAttempts?: number
  }
): Promise<ExamDTO> {
  const exam = await Exam.findOne({ _id: examId, organizationId: orgId })
  if (!exam || exam.status === 'archived') {
    throw new AppError('Exam not found', 404, 'EXAM_NOT_FOUND')
  }

  if (data.title !== undefined) exam.title = data.title.trim()
  if (data.description !== undefined) exam.description = data.description
  if (data.timeLimitMinutes !== undefined) exam.timeLimitMinutes = data.timeLimitMinutes
  if (data.passingScorePercent !== undefined) exam.passingScorePercent = data.passingScorePercent
  if (data.shuffleQuestions !== undefined) exam.shuffleQuestions = data.shuffleQuestions
  if (data.shuffleOptions !== undefined) exam.shuffleOptions = data.shuffleOptions
  if (data.maxAttempts !== undefined) exam.maxAttempts = data.maxAttempts

  if (data.questionIds !== undefined) {
    const count = await Question.countDocuments({
      _id: { $in: data.questionIds },
      organizationId: orgId,
      isActive: true,
    })
    if (count !== data.questionIds.length) {
      throw new AppError(
        'Some questions are invalid for this organization',
        400,
        'INVALID_QUESTIONS'
      )
    }
    exam.questionIds = data.questionIds as any
    exam.totalPoints = await recalcTotalPoints(data.questionIds)
  }

  await exam.save()
  return toExamDTO(exam)
}

export async function publishExam(orgId: string, examId: string): Promise<ExamDTO> {
  const exam = await Exam.findOne({ _id: examId, organizationId: orgId })
  if (!exam || exam.status === 'archived') {
    throw new AppError('Exam not found', 404, 'EXAM_NOT_FOUND')
  }
  if (!exam.questionIds?.length) {
    throw new AppError('Exam must have at least one question', 400, 'EMPTY_EXAM')
  }
  exam.status = 'published'
  exam.totalPoints = await recalcTotalPoints(exam.questionIds.map((id) => id.toString()))
  await exam.save()
  return toExamDTO(exam)
}

export async function archiveExam(orgId: string, examId: string): Promise<void> {
  const exam = await Exam.findOne({ _id: examId, organizationId: orgId })
  if (!exam) throw new AppError('Exam not found', 404, 'EXAM_NOT_FOUND')
  exam.status = 'archived'
  await exam.save()
}

async function gradeAttempt(
  attempt: InstanceType<typeof ExamAttempt>,
  passingScorePercent: number
) {
  let score = 0
  const maxScore = (attempt.questionSnapshot || []).reduce(
    (s, q) => s + (q.points || 0),
    0
  )
  for (const q of attempt.questionSnapshot || []) {
    const ans = attempt.answers?.find((a) => a.questionId === q.id)
    const selected = ans?.selected ?? []
    if (q.type === 'short_answer') continue
    if (arraysEqualAsSet(selected, q.correctAnswers || [])) {
      score += q.points || 0
    }
  }
  const percent = maxScore > 0 ? Math.round((score / maxScore) * 1000) / 10 : 0
  attempt.score = score
  attempt.maxScore = maxScore
  attempt.percent = percent
  attempt.passed = percent >= passingScorePercent
}

export async function startAttempt(
  orgId: string,
  examId: string,
  userId: string
): Promise<ExamAttemptDTO> {
  const exam = await Exam.findOne({ _id: examId, organizationId: orgId })
  if (!exam || exam.status !== 'published') {
    throw new AppError('Exam is not available', 404, 'EXAM_NOT_AVAILABLE')
  }

  const inProgress = await ExamAttempt.findOne({
    examId,
    userId,
    status: 'in_progress',
  })
  if (inProgress) {
    if (inProgress.expiresAt && inProgress.expiresAt < new Date()) {
      inProgress.status = 'timed_out'
      await gradeAttempt(inProgress, exam.passingScorePercent)
      await inProgress.save()
    } else {
      return toAttemptDTO(inProgress, {
        includeQuestions: true,
        examTitle: exam.title,
      })
    }
  }

  const submittedCount = await ExamAttempt.countDocuments({
    examId,
    userId,
    status: { $in: ['submitted', 'timed_out'] },
  })
  if (submittedCount >= exam.maxAttempts) {
    throw new AppError('Maximum attempts reached', 403, 'MAX_ATTEMPTS')
  }

  let questions = await Question.find({
    _id: { $in: exam.questionIds },
    organizationId: orgId,
    isActive: true,
  })

  if (questions.length === 0) {
    throw new AppError('Exam has no active questions', 400, 'EMPTY_EXAM')
  }

  if (exam.shuffleQuestions) questions = shuffle(questions)

  const snapshot = questions.map((q) => {
    let options = (q.options || []).map((o) => ({ id: o.id, text: o.text }))
    if (exam.shuffleOptions) options = shuffle(options)
    return {
      id: q.id,
      type: q.type,
      stem: q.stem,
      options,
      points: q.points,
      difficulty: q.difficulty,
      correctAnswers: q.correctAnswers || [],
    }
  })

  const startedAt = new Date()
  const expiresAt =
    exam.timeLimitMinutes != null
      ? new Date(startedAt.getTime() + exam.timeLimitMinutes * 60_000)
      : null

  const attempt = await ExamAttempt.create({
    examId,
    organizationId: orgId,
    userId,
    status: 'in_progress',
    startedAt,
    expiresAt,
    answers: [],
    questionSnapshot: snapshot,
    maxScore: snapshot.reduce((s, q) => s + (q.points || 0), 0),
  })

  return toAttemptDTO(attempt, { includeQuestions: true, examTitle: exam.title })
}

export async function getAttempt(
  orgId: string,
  attemptId: string,
  userId: string,
  isStaff: boolean
): Promise<ExamAttemptDTO> {
  const attempt = await ExamAttempt.findOne({ _id: attemptId, organizationId: orgId })
  if (!attempt) throw new AppError('Attempt not found', 404, 'ATTEMPT_NOT_FOUND')
  if (!isStaff && attempt.userId.toString() !== userId) {
    throw new AppError('Forbidden', 403, 'FORBIDDEN')
  }

  const exam = await Exam.findById(attempt.examId)

  if (
    attempt.status === 'in_progress' &&
    attempt.expiresAt &&
    attempt.expiresAt < new Date()
  ) {
    attempt.status = 'timed_out'
    attempt.submittedAt = new Date()
    await gradeAttempt(attempt, exam?.passingScorePercent ?? 50)
    await attempt.save()
  }

  let certificateId: string | null = null
  let certificateCode: string | null = null
  if (attempt.status === 'submitted' || attempt.status === 'timed_out') {
    const existing = await Certificate.findOne({ attemptId: attempt.id })
    if (existing) {
      certificateId = existing.id
      certificateCode = existing.code
    }
  }

  return toAttemptDTO(attempt, {
    includeQuestions: true,
    examTitle: exam?.title,
    certificateId,
    certificateCode,
  })
}

export async function saveAnswers(
  orgId: string,
  attemptId: string,
  userId: string,
  answers: { questionId: string; selected: string[] }[]
): Promise<ExamAttemptDTO> {
  const attempt = await ExamAttempt.findOne({
    _id: attemptId,
    organizationId: orgId,
    userId,
  })
  if (!attempt) throw new AppError('Attempt not found', 404, 'ATTEMPT_NOT_FOUND')
  if (attempt.status !== 'in_progress') {
    throw new AppError('Attempt is already closed', 400, 'ATTEMPT_CLOSED')
  }
  if (attempt.expiresAt && attempt.expiresAt < new Date()) {
    const exam = await Exam.findById(attempt.examId)
    attempt.status = 'timed_out'
    attempt.submittedAt = new Date()
    await gradeAttempt(attempt, exam?.passingScorePercent ?? 50)
    await attempt.save()
    throw new AppError('Time is up', 400, 'TIME_UP')
  }

  const validIds = new Set((attempt.questionSnapshot || []).map((q) => q.id))
  attempt.answers = answers
    .filter((a) => validIds.has(a.questionId))
    .map((a) => ({ questionId: a.questionId, selected: a.selected ?? [] }))
  await attempt.save()

  const exam = await Exam.findById(attempt.examId)
  return toAttemptDTO(attempt, { includeQuestions: true, examTitle: exam?.title })
}

export async function submitAttempt(
  orgId: string,
  attemptId: string,
  userId: string,
  answers?: { questionId: string; selected: string[] }[]
): Promise<ExamAttemptDTO> {
  const attempt = await ExamAttempt.findOne({
    _id: attemptId,
    organizationId: orgId,
    userId,
  })
  if (!attempt) throw new AppError('Attempt not found', 404, 'ATTEMPT_NOT_FOUND')
  if (attempt.status !== 'in_progress') {
    throw new AppError('Attempt is already closed', 400, 'ATTEMPT_CLOSED')
  }

  if (answers) {
    const validIds = new Set((attempt.questionSnapshot || []).map((q) => q.id))
    attempt.answers = answers
      .filter((a) => validIds.has(a.questionId))
      .map((a) => ({ questionId: a.questionId, selected: a.selected ?? [] }))
  }

  const exam = await Exam.findById(attempt.examId)
  const timedOut = !!(attempt.expiresAt && attempt.expiresAt < new Date())
  attempt.status = timedOut ? 'timed_out' : 'submitted'
  attempt.submittedAt = new Date()
  await gradeAttempt(attempt, exam?.passingScorePercent ?? 50)
  await attempt.save()

  let certificateId: string | null = null
  let certificateCode: string | null = null
  if (attempt.passed) {
    try {
      const cert = await certService.issueCertificateForAttempt(
        orgId,
        attempt.id,
        userId,
        false
      )
      certificateId = cert.id
      certificateCode = cert.code
    } catch {
      const existing = await Certificate.findOne({ attemptId: attempt.id })
      if (existing) {
        certificateId = existing.id
        certificateCode = existing.code
      }
    }
  } else {
    const existing = await Certificate.findOne({ attemptId: attempt.id })
    if (existing) {
      certificateId = existing.id
      certificateCode = existing.code
    }
  }

  return toAttemptDTO(attempt, {
    includeQuestions: true,
    examTitle: exam?.title,
    certificateId,
    certificateCode,
  })
}

export async function listMyAttempts(
  orgId: string,
  examId: string,
  userId: string
): Promise<ExamAttemptDTO[]> {
  const attempts = await ExamAttempt.find({
    organizationId: orgId,
    examId,
    userId,
  }).sort({ createdAt: -1 })
  return attempts.map((a) => toAttemptDTO(a))
}
