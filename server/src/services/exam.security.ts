import { ExamAttempt, type SecurityEventType } from '../models/ExamAttempt.js'
import { Exam } from '../models/Exam.js'
import { AppError } from '../middlewares/errorHandler.js'

const MAX_EVENTS_STORED = 100

export async function logSecurityEvent(
  orgId: string,
  attemptId: string,
  userId: string,
  type: SecurityEventType,
  meta?: string | null
): Promise<{
  focusLossCount: number
  tabSwitchCount: number
  pasteCount: number
  eventCount: number
}> {
  const attempt = await ExamAttempt.findOne({
    _id: attemptId,
    organizationId: orgId,
    userId,
  })
  if (!attempt) throw new AppError('Attempt not found', 404, 'ATTEMPT_NOT_FOUND')
  if (attempt.status !== 'in_progress') {
    throw new AppError('Attempt is closed', 400, 'ATTEMPT_CLOSED')
  }

  const exam = await Exam.findById(attempt.examId)
  if (!exam) throw new AppError('Exam not found', 404, 'EXAM_NOT_FOUND')

  // Respect exam policies
  if (type === 'paste' && exam.trackPaste === false) {
    return summary(attempt)
  }
  if (
    (type === 'tab_switch' || type === 'visibility_hidden' || type === 'focus_loss') &&
    exam.trackTabSwitch === false
  ) {
    return summary(attempt)
  }

  const event = { type, at: new Date(), meta: meta?.slice(0, 200) || null }
  attempt.securityEvents = attempt.securityEvents || []
  attempt.securityEvents.push(event)
  if (attempt.securityEvents.length > MAX_EVENTS_STORED) {
    attempt.securityEvents = attempt.securityEvents.slice(-MAX_EVENTS_STORED)
  }

  if (type === 'focus_loss' || type === 'visibility_hidden') {
    attempt.focusLossCount = (attempt.focusLossCount || 0) + 1
  }
  if (type === 'tab_switch' || type === 'visibility_hidden') {
    attempt.tabSwitchCount = (attempt.tabSwitchCount || 0) + 1
  }
  if (type === 'paste') {
    attempt.pasteCount = (attempt.pasteCount || 0) + 1
  }

  await attempt.save()
  return summary(attempt)
}

function summary(attempt: InstanceType<typeof ExamAttempt>) {
  return {
    focusLossCount: attempt.focusLossCount || 0,
    tabSwitchCount: attempt.tabSwitchCount || 0,
    pasteCount: attempt.pasteCount || 0,
    eventCount: (attempt.securityEvents || []).length,
  }
}

export function securitySummaryFromAttempt(attempt: {
  focusLossCount?: number
  tabSwitchCount?: number
  pasteCount?: number
  securityEvents?: { type: string; at: Date | string; meta?: string | null }[]
}) {
  return {
    focusLossCount: attempt.focusLossCount || 0,
    tabSwitchCount: attempt.tabSwitchCount || 0,
    pasteCount: attempt.pasteCount || 0,
    events: (attempt.securityEvents || []).slice(-50).map((e) => ({
      type: e.type,
      at: e.at instanceof Date ? e.at.toISOString() : String(e.at),
      meta: e.meta ?? null,
    })),
  }
}
