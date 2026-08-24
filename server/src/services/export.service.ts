import { Exam } from '../models/Exam.js'
import { ExamAttempt } from '../models/ExamAttempt.js'
import { User } from '../models/User.js'
import { AppError } from '../middlewares/errorHandler.js'

function csvEscape(value: string | number | boolean | null | undefined): string {
  if (value == null) return ''
  const s = String(value)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function toCsv(rows: (string | number | boolean | null | undefined)[][]): string {
  return rows.map((r) => r.map(csvEscape).join(',')).join('\n') + '\n'
}

async function userNameMap(userIds: string[]): Promise<Map<string, string>> {
  const unique = [...new Set(userIds.filter(Boolean))]
  if (unique.length === 0) return new Map()
  const users = await User.find({ _id: { $in: unique } }).select('firstName lastName email')
  const map = new Map<string, string>()
  for (const u of users) {
    map.set(u.id, `${u.firstName} ${u.lastName}`.trim() || u.email)
  }
  return map
}

/** Org-wide attempts report (completed + in progress), max 2000 rows. */
export async function exportOrgAttemptsCsv(orgId: string): Promise<{ filename: string; csv: string }> {
  const attempts = await ExamAttempt.find({ organizationId: orgId })
    .sort({ submittedAt: -1, createdAt: -1 })
    .limit(2000)

  const examIds = [...new Set(attempts.map((a) => a.examId.toString()))]
  const exams = await Exam.find({ _id: { $in: examIds } })
  const examTitle = new Map(exams.map((e) => [e.id, e.title]))

  const names = await userNameMap(attempts.map((a) => a.userId.toString()))

  const header = [
    'attemptId',
    'examId',
    'examTitle',
    'userId',
    'studentName',
    'status',
    'score',
    'maxScore',
    'percent',
    'passed',
    'needsManualGrading',
    'focusLossCount',
    'tabSwitchCount',
    'pasteCount',
    'startedAt',
    'submittedAt',
  ]

  const rows = attempts.map((a) => [
    a.id,
    a.examId.toString(),
    examTitle.get(a.examId.toString()) || '',
    a.userId.toString(),
    names.get(a.userId.toString()) || '',
    a.status,
    a.score ?? '',
    a.maxScore ?? '',
    a.percent ?? '',
    a.passed == null ? '' : a.passed ? 'yes' : 'no',
    a.needsManualGrading ? 'yes' : 'no',
    a.focusLossCount ?? 0,
    a.tabSwitchCount ?? 0,
    a.pasteCount ?? 0,
    a.startedAt?.toISOString() ?? '',
    a.submittedAt?.toISOString() ?? '',
  ])

  return {
    filename: `examflow-org-attempts-${orgId.slice(-6)}-${Date.now()}.csv`,
    csv: toCsv([header, ...rows]),
  }
}

/** Per-exam attempts report. */
export async function exportExamAttemptsCsv(
  orgId: string,
  examId: string
): Promise<{ filename: string; csv: string }> {
  const exam = await Exam.findOne({ _id: examId, organizationId: orgId })
  if (!exam || exam.status === 'archived') {
    throw new AppError('Exam not found', 404, 'EXAM_NOT_FOUND')
  }

  const attempts = await ExamAttempt.find({ organizationId: orgId, examId }).sort({
    submittedAt: -1,
    createdAt: -1,
  })

  const names = await userNameMap(attempts.map((a) => a.userId.toString()))

  const header = [
    'attemptId',
    'userId',
    'studentName',
    'status',
    'score',
    'maxScore',
    'percent',
    'passed',
    'needsManualGrading',
    'focusLossCount',
    'tabSwitchCount',
    'pasteCount',
    'startedAt',
    'submittedAt',
  ]

  const rows = attempts.map((a) => [
    a.id,
    a.userId.toString(),
    names.get(a.userId.toString()) || '',
    a.status,
    a.score ?? '',
    a.maxScore ?? '',
    a.percent ?? '',
    a.passed == null ? '' : a.passed ? 'yes' : 'no',
    a.needsManualGrading ? 'yes' : 'no',
    a.focusLossCount ?? 0,
    a.tabSwitchCount ?? 0,
    a.pasteCount ?? 0,
    a.startedAt?.toISOString() ?? '',
    a.submittedAt?.toISOString() ?? '',
  ])

  const safeTitle = exam.title.replace(/[^a-zA-Z0-9_-]+/g, '_').slice(0, 40)
  return {
    filename: `examflow-${safeTitle}-attempts-${Date.now()}.csv`,
    csv: toCsv([header, ...rows]),
  }
}
