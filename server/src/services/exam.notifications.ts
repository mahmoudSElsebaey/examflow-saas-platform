import * as notifService from './notification.service.js'
import { sendEmail, examPublishedEmail } from './email.service.js'
import { Membership } from '../models/Membership.js'
import { User } from '../models/User.js'
import { Organization } from '../models/Organization.js'

export async function onExamPublished(
  orgId: string,
  exam: { title: string }
): Promise<void> {
  try {
    const link = `/app/organizations/${orgId}/exams`
    await notifService.notifyOrgStudents(orgId, {
      type: 'exam_published',
      title: 'New exam available',
      body: `"${exam.title}" is now available.`,
      link,
    })
    const org = await Organization.findById(orgId)
    const members = await Membership.find({
      organizationId: orgId,
      role: 'student',
      status: 'active',
    }).select('userId')
    const users = await User.find({
      _id: { $in: members.map((m) => m.userId) },
    }).select('email')
    for (const u of users) {
      if (u.email) {
        void sendEmail(
          examPublishedEmail(u.email, exam.title, org?.name || 'Organization', orgId)
        )
      }
    }
  } catch {
    // non-blocking
  }
}

export async function onAttemptSubmitted(
  orgId: string,
  userId: string,
  attempt: { id: string; needsManualGrading?: boolean },
  examTitle?: string
): Promise<void> {
  try {
    if (attempt.needsManualGrading) {
      await notifService.notifyOrgStaff(orgId, {
        type: 'grading_needed',
        title: 'Manual grading needed',
        body: `An attempt for "${examTitle || 'Exam'}" needs short-answer grading.`,
        link: `/app/organizations/${orgId}/grading/${attempt.id}`,
      })
    } else {
      await notifService.createNotification({
        userId,
        organizationId: orgId,
        type: 'result_ready',
        title: 'Results ready',
        body: `Your results for "${examTitle || 'Exam'}" are ready.`,
        link: `/app/organizations/${orgId}/attempts/${attempt.id}`,
      })
    }
  } catch {
    // non-blocking
  }
}
