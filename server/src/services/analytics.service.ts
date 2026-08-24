import { Exam } from '../models/Exam.js'
import { ExamAttempt } from '../models/ExamAttempt.js'
import { Question } from '../models/Question.js'
import { User } from '../models/User.js'
import { AppError } from '../middlewares/errorHandler.js'
import type { OrgAnalyticsDTO, ExamAnalyticsDTO, StudentHistoryDTO } from '../types/analytics.js'
import { LessonProgress } from '../models/LessonProgress.js'
import { Lesson } from '../models/Lesson.js'

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

  const userIds = [...new Set(attempts.slice(0, 10).map((a) => a.userId.toString()))]
  const users = await User.find({ _id: { $in: userIds } }).select('firstName lastName')
  const nameMap = new Map(users.map((u) => [u.id, `${u.firstName} ${u.lastName}`.trim()]))

  const recentAttempts = attempts.slice(0, 10).map((a) => ({
    id: a.id,
    examId: a.examId.toString(),
    examTitle: examTitleMap.get(a.examId.toString()) || 'Exam',
    userId: a.userId.toString(),
    studentName: nameMap.get(a.userId.toString()) || undefined,
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

  const userIds = [...new Set(attempts.map((a) => a.userId.toString()))]
  const users = await User.find({ _id: { $in: userIds } }).select('firstName lastName email')
  const nameMap = new Map(
    users.map((u) => [u.id, `${u.firstName} ${u.lastName}`.trim() || u.email])
  )

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
    attempts: attempts.map((a) => ({
      id: a.id,
      userId: a.userId.toString(),
      studentName: nameMap.get(a.userId.toString()) || undefined,
      status: a.status,
      score: a.score ?? null,
      maxScore: a.maxScore ?? null,
      percent: a.percent ?? null,
      passed: a.passed ?? null,
      focusLossCount: a.focusLossCount ?? 0,
      tabSwitchCount: a.tabSwitchCount ?? 0,
      pasteCount: a.pasteCount ?? 0,
      startedAt: a.startedAt.toISOString(),
      submittedAt: a.submittedAt?.toISOString() ?? null,
    })),
  }
}

export async function getStudentHistory(
  userId: string,
  orgId: string
): Promise<StudentHistoryDTO> {
  const [attempts, progress] = await Promise.all([
    ExamAttempt.find({ organizationId: orgId, userId }).sort({ createdAt: -1 }).limit(50),
    LessonProgress.find({ organizationId: orgId, userId }).sort({ updatedAt: -1 }).limit(50),
  ])

  const examIds = [...new Set(attempts.map((a) => a.examId.toString()))]
  const exams = await Exam.find({ _id: { $in: examIds } })
  const examTitleMap = new Map(exams.map((e) => [e.id, e.title]))

  const completed = attempts.filter(
    (a) => a.status === 'submitted' || a.status === 'timed_out'
  )
  const percents = completed
    .map((a) => a.percent)
    .filter((p): p is number => p != null)
  const passed = completed.filter((a) => a.passed === true).length

  const lessonIds = progress.map((p) => p.lessonId)
  const lessons = await Lesson.find({ _id: { $in: lessonIds } })
  const lessonTitleMap = new Map(lessons.map((l) => [l.id, l.title]))

  return {
    attemptsCount: attempts.length,
    completedCount: completed.length,
    averagePercent:
      percents.length > 0
        ? Math.round((percents.reduce((a, b) => a + b, 0) / percents.length) * 10) / 10
        : null,
    passRate:
      completed.length > 0
        ? Math.round((passed / completed.length) * 1000) / 10
        : null,
    lessonsViewed: progress.length,
    lessonsCompleted: progress.filter((p) => p.status === 'completed').length,
    attempts: attempts.map((a) => ({
      id: a.id,
      examId: a.examId.toString(),
      examTitle: examTitleMap.get(a.examId.toString()) || 'Exam',
      status: a.status,
      percent: a.percent ?? null,
      passed: a.passed ?? null,
      startedAt: a.startedAt.toISOString(),
      submittedAt: a.submittedAt?.toISOString() ?? null,
    })),
    recentLessons: progress.map((p) => ({
      lessonId: p.lessonId.toString(),
      lessonTitle: lessonTitleMap.get(p.lessonId.toString()) || 'Lesson',
      status: p.status,
      viewedAt: p.viewedAt.toISOString(),
      completedAt: p.completedAt?.toISOString() ?? null,
    })),
  }
}
