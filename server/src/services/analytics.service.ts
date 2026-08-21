import { Exam } from '../models/Exam.js'
import { ExamAttempt } from '../models/ExamAttempt.js'
import { Question } from '../models/Question.js'
import { AppError } from '../middlewares/errorHandler.js'
import type { OrgAnalyticsDTO, ExamAnalyticsDTO } from '../types/analytics.js'

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10
}

export async function getOrgAnalytics(orgId: string): Promise<OrgAnalyticsDTO> {
  const [exams, questionsCount, attempts] = await Promise.all([
    Exam.find({ organizationId: orgId, status: { $ne: 'archived' } }),
    Question.countDocuments({ organizationId: orgId, isActive: true }),
    ExamAttempt.find({ organizationId: orgId }).sort({ createdAt: -1 }).limit(200),
  ])

  const publishedExamsCount = exams.filter((e) => e.status === 'published').length
  const completed = attempts.filter(
    (a) => a.status === 'submitted' || a.status === 'timed_out'
  )
  const percents = completed
    .map((a) => a.percent)
    .filter((p): p is number => p != null)
  const passed = completed.filter((a) => a.passed === true).length

  const examTitleMap = new Map(exams.map((e) => [e.id, e.title]))

  const recentAttempts = attempts.slice(0, 10).map((a) => ({
    id: a.id,
    examId: a.examId.toString(),
    examTitle: examTitleMap.get(a.examId.toString()) || 'Exam',
    userId: a.userId.toString(),
    status: a.status,
    percent: a.percent ?? null,
    passed: a.passed ?? null,
    submittedAt: a.submittedAt?.toISOString() ?? null,
  }))

  return {
    examsCount: exams.length,
    publishedExamsCount,
    questionsCount,
    attemptsCount: attempts.length,
    completedAttemptsCount: completed.length,
    averagePercent: avg(percents),
    passRate:
      completed.length > 0
        ? Math.round((passed / completed.length) * 1000) / 10
        : null,
    recentAttempts,
  }
}

export async function getExamAnalytics(
  orgId: string,
  examId: string
): Promise<ExamAnalyticsDTO> {
  const exam = await Exam.findOne({ _id: examId, organizationId: orgId })
  if (!exam || exam.status === 'archived') {
    throw new AppError('Exam not found', 404, 'EXAM_NOT_FOUND')
  }

  const attempts = await ExamAttempt.find({
    organizationId: orgId,
    examId,
  }).sort({ createdAt: -1 })

  const completed = attempts.filter(
    (a) => a.status === 'submitted' || a.status === 'timed_out'
  )
  const percents = completed
    .map((a) => a.percent)
    .filter((p): p is number => p != null)
  const passed = completed.filter((a) => a.passed === true).length

  return {
    examId: exam.id,
    examTitle: exam.title,
    attemptsCount: attempts.length,
    completedCount: completed.length,
    averagePercent: avg(percents),
    passRate:
      completed.length > 0
        ? Math.round((passed / completed.length) * 1000) / 10
        : null,
    minPercent: percents.length ? Math.min(...percents) : null,
    maxPercent: percents.length ? Math.max(...percents) : null,
    attempts: attempts.slice(0, 50).map((a) => ({
      id: a.id,
      userId: a.userId.toString(),
      status: a.status,
      score: a.score ?? null,
      maxScore: a.maxScore ?? null,
      percent: a.percent ?? null,
      passed: a.passed ?? null,
      startedAt: a.startedAt.toISOString(),
      submittedAt: a.submittedAt?.toISOString() ?? null,
    })),
  }
}
