import { Exam } from '../models/Exam.js'
import { ExamAttempt } from '../models/ExamAttempt.js'
import { User } from '../models/User.js'
import { Certificate } from '../models/Certificate.js'
import { AppError } from '../middlewares/errorHandler.js'
import type { ExamAttemptDTO, GradingQueueItem } from '../types/exam.js'
import * as certService from './certificate.service.js'
import { gradeAttempt, toAttemptDTO } from './exam.service.js'

export async function listPendingGrading(orgId: string): Promise<GradingQueueItem[]> {
  const attempts = await ExamAttempt.find({
    organizationId: orgId,
    status: { $in: ['submitted', 'timed_out'] },
    needsManualGrading: true,
  })
    .sort({ submittedAt: -1 })
    .limit(100)

  const examIds = [...new Set(attempts.map((a) => a.examId.toString()))]
  const userIds = [...new Set(attempts.map((a) => a.userId.toString()))]
  const [exams, users] = await Promise.all([
    Exam.find({ _id: { $in: examIds } }),
    User.find({ _id: { $in: userIds } }),
  ])
  const examMap = new Map(exams.map((e) => [e.id, e.title]))
  const userMap = new Map(
    users.map((u) => [u.id, `${u.firstName} ${u.lastName}`.trim()])
  )

  return attempts.map((a) => {
    let pending = 0
    for (const q of a.questionSnapshot || []) {
      if (q.type !== 'short_answer') continue
      const ans = a.answers?.find((x) => x.questionId === q.id)
      const hasText = (ans?.selected ?? []).some((s) => (s || '').trim().length > 0)
      if (hasText && ans?.manualScore == null) pending++
    }
    return {
      id: a.id,
      examId: a.examId.toString(),
      examTitle: examMap.get(a.examId.toString()) || 'Exam',
      userId: a.userId.toString(),
      studentName: userMap.get(a.userId.toString()) || 'Student',
      status: a.status,
      submittedAt: a.submittedAt?.toISOString() ?? null,
      pendingManualCount: pending,
      score: a.score ?? null,
      maxScore: a.maxScore ?? null,
      percent: a.percent ?? null,
    }
  })
}

export async function applyManualGrades(
  orgId: string,
  attemptId: string,
  graderId: string,
  grades: { questionId: string; points: number; feedback?: string | null }[]
): Promise<ExamAttemptDTO> {
  const attempt = await ExamAttempt.findOne({
    _id: attemptId,
    organizationId: orgId,
  })
  if (!attempt) throw new AppError('Attempt not found', 404, 'ATTEMPT_NOT_FOUND')
  if (attempt.status !== 'submitted' && attempt.status !== 'timed_out') {
    throw new AppError('Attempt is not completed', 400, 'ATTEMPT_NOT_COMPLETED')
  }

  const exam = await Exam.findById(attempt.examId)
  const snapById = new Map((attempt.questionSnapshot || []).map((q) => [q.id, q]))
  const gradeMap = new Map(grades.map((g) => [g.questionId, g]))

  const answers = [...(attempt.answers || [])]
  for (const [qId, g] of gradeMap) {
    const q = snapById.get(qId)
    if (!q || q.type !== 'short_answer') {
      throw new AppError(`Question ${qId} is not a short-answer item`, 400, 'INVALID_GRADE')
    }
    const maxPts = q.points || 0
    if (g.points > maxPts) {
      throw new AppError(
        `Points for question exceed maximum (${maxPts})`,
        400,
        'POINTS_EXCEED_MAX'
      )
    }
    let row = answers.find((a) => a.questionId === qId)
    if (!row) {
      row = { questionId: qId, selected: [] }
      answers.push(row)
    }
    row.manualScore = g.points
    row.feedback = g.feedback ?? null
    row.gradedAt = new Date()
    row.gradedBy = graderId as any
  }
  attempt.answers = answers as any
  await gradeAttempt(attempt, exam?.passingScorePercent ?? 50)
  await attempt.save()

  let certificateId: string | null = null
  let certificateCode: string | null = null
  if (attempt.passed && !attempt.needsManualGrading) {
    try {
      const cert = await certService.issueCertificateForAttempt(
        orgId,
        attempt.id,
        graderId,
        true
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

  const student = await User.findById(attempt.userId)
  const dto = toAttemptDTO(attempt, {
    includeQuestions: true,
    examTitle: exam?.title,
    certificateId,
    certificateCode,
  })
  dto.studentName = student
    ? `${student.firstName} ${student.lastName}`.trim()
    : undefined
  return dto
}

export async function getAttemptForGrading(
  orgId: string,
  attemptId: string
): Promise<ExamAttemptDTO> {
  const attempt = await ExamAttempt.findOne({
    _id: attemptId,
    organizationId: orgId,
  })
  if (!attempt) throw new AppError('Attempt not found', 404, 'ATTEMPT_NOT_FOUND')
  if (attempt.status === 'in_progress') {
    throw new AppError('Attempt still in progress', 400, 'ATTEMPT_IN_PROGRESS')
  }
  const exam = await Exam.findById(attempt.examId)
  const student = await User.findById(attempt.userId)
  const dto = toAttemptDTO(attempt, {
    includeQuestions: true,
    examTitle: exam?.title,
  })
  dto.studentName = student
    ? `${student.firstName} ${student.lastName}`.trim()
    : undefined
  return dto
}
