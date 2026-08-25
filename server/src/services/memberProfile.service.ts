import { Membership } from '../models/Membership.js'
import { User } from '../models/User.js'
import { ExamAttempt } from '../models/ExamAttempt.js'
import { Exam } from '../models/Exam.js'
import { LessonProgress } from '../models/LessonProgress.js'
import { Lesson } from '../models/Lesson.js'
import { Certificate } from '../models/Certificate.js'
import { AppError } from '../middlewares/errorHandler.js'

export interface MemberProfileDTO {
  userId: string
  firstName: string
  lastName: string
  email?: string
  role: string
  status: string
  joinedAt: string
  stats: {
    attemptsCount: number
    completedCount: number
    averagePercent: number | null
    passRate: number | null
    lessonsViewed: number
    lessonsCompleted: number
    certificatesCount: number
  }
  recentAttempts: {
    id: string
    examId: string
    examTitle: string
    status: string
    percent: number | null
    passed: boolean | null
    submittedAt: string | null
  }[]
  recentLessons: {
    lessonId: string
    lessonTitle: string
    status: string
    viewedAt: string
    completedAt: string | null
  }[]
  certificates: {
    id: string
    examTitle: string
    issuedAt: string
    code: string
    percent: number
  }[]
}

export async function getMemberProfile(
  orgId: string,
  viewerId: string,
  targetUserId: string
): Promise<MemberProfileDTO> {
  const viewerMembership = await Membership.findOne({
    organizationId: orgId,
    userId: viewerId,
    status: 'active',
  })
  if (!viewerMembership) {
    throw new AppError('Organization not found', 404, 'ORG_NOT_FOUND')
  }

  const isSelf = viewerId === targetUserId
  const isManager = ['owner', 'admin'].includes(viewerMembership.role)
  if (!isSelf && !isManager) {
    throw new AppError('Insufficient permissions', 403, 'FORBIDDEN')
  }

  const targetMembership = await Membership.findOne({
    organizationId: orgId,
    userId: targetUserId,
  })
  if (!targetMembership) {
    throw new AppError('Member not found', 404, 'MEMBER_NOT_FOUND')
  }

  const user = await User.findById(targetUserId).select('firstName lastName email')
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND')

  const [attempts, progress, certs] = await Promise.all([
    ExamAttempt.find({ organizationId: orgId, userId: targetUserId })
      .sort({ createdAt: -1 })
      .limit(40),
    LessonProgress.find({ organizationId: orgId, userId: targetUserId })
      .sort({ updatedAt: -1 })
      .limit(30),
    Certificate.find({ organizationId: orgId, userId: targetUserId })
      .sort({ issuedAt: -1 })
      .limit(20),
  ])

  const examIds = [...new Set(attempts.map((a) => a.examId.toString()))]
  const exams = await Exam.find({ _id: { $in: examIds } })
  const examTitle = new Map(exams.map((e) => [e.id, e.title]))

  const lessonIds = progress.map((p) => p.lessonId)
  const lessons = await Lesson.find({ _id: { $in: lessonIds } })
  const lessonTitle = new Map(lessons.map((l) => [l.id, l.title]))

  const completed = attempts.filter(
    (a) => a.status === 'submitted' || a.status === 'timed_out'
  )
  const percents = completed
    .map((a) => a.percent)
    .filter((p): p is number => p != null)
  const passed = completed.filter((a) => a.passed === true).length

  return {
    userId: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: isSelf || isManager ? user.email : undefined,
    role: targetMembership.role,
    status: targetMembership.status,
    joinedAt: targetMembership.createdAt.toISOString(),
    stats: {
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
      certificatesCount: certs.length,
    },
    recentAttempts: attempts.slice(0, 15).map((a) => ({
      id: a.id,
      examId: a.examId.toString(),
      examTitle: examTitle.get(a.examId.toString()) || 'Exam',
      status: a.status,
      percent: a.percent ?? null,
      passed: a.passed ?? null,
      submittedAt: a.submittedAt?.toISOString() ?? null,
    })),
    recentLessons: progress.slice(0, 15).map((p) => ({
      lessonId: p.lessonId.toString(),
      lessonTitle: lessonTitle.get(p.lessonId.toString()) || 'Lesson',
      status: p.status,
      viewedAt: p.viewedAt.toISOString(),
      completedAt: p.completedAt?.toISOString() ?? null,
    })),
    certificates: certs.map((c) => ({
      id: c.id,
      examTitle: c.examTitle,
      issuedAt: c.issuedAt.toISOString(),
      code: c.code,
      percent: c.percent,
    })),
  }
}
