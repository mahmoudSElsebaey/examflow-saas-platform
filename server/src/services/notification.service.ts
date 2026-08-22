import { Notification } from '../models/Notification.js'
import type { NotificationType } from '../models/Notification.js'
import { AppError } from '../middlewares/errorHandler.js'

export type NotificationDTO = {
  id: string
  type: NotificationType
  title: string
  body: string
  link?: string | null
  organizationId?: string | null
  readAt?: string | null
  createdAt: string
}

function toDTO(n: InstanceType<typeof Notification>): NotificationDTO {
  return {
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    link: n.link ?? null,
    organizationId: n.organizationId?.toString() ?? null,
    readAt: n.readAt?.toISOString() ?? null,
    createdAt: n.createdAt.toISOString(),
  }
}

export async function createNotification(input: {
  userId: string
  organizationId?: string | null
  type: NotificationType
  title: string
  body: string
  link?: string | null
}): Promise<NotificationDTO> {
  const n = await Notification.create({
    userId: input.userId,
    organizationId: input.organizationId || null,
    type: input.type,
    title: input.title,
    body: input.body,
    link: input.link || null,
  })
  return toDTO(n)
}

export async function listNotifications(
  userId: string,
  limit = 30
): Promise<{ items: NotificationDTO[]; unreadCount: number }> {
  const [items, unreadCount] = await Promise.all([
    Notification.find({ userId }).sort({ createdAt: -1 }).limit(limit),
    Notification.countDocuments({ userId, readAt: null }),
  ])
  return { items: items.map(toDTO), unreadCount }
}

export async function markRead(userId: string, id: string): Promise<void> {
  const n = await Notification.findOne({ _id: id, userId })
  if (!n) throw new AppError('Notification not found', 404, 'NOT_FOUND')
  if (!n.readAt) {
    n.readAt = new Date()
    await n.save()
  }
}

export async function markAllRead(userId: string): Promise<void> {
  await Notification.updateMany(
    { userId, readAt: null },
    { $set: { readAt: new Date() } }
  )
}

/** Notify all active student members of an organization (best-effort). */
export async function notifyOrgStudents(
  organizationId: string,
  input: {
    type: NotificationType
    title: string
    body: string
    link?: string | null
  }
): Promise<number> {
  const { Membership } = await import('../models/Membership.js')
  const members = await Membership.find({
    organizationId,
    role: 'student',
    status: 'active',
  }).select('userId')
  let count = 0
  for (const m of members) {
    try {
      await createNotification({
        userId: m.userId.toString(),
        organizationId,
        type: input.type,
        title: input.title,
        body: input.body,
        link: input.link,
      })
      count += 1
    } catch {
      // best-effort
    }
  }
  return count
}

/** Notify staff (owner/admin/teacher/examiner) in an org. */
export async function notifyOrgStaff(
  organizationId: string,
  input: {
    type: NotificationType
    title: string
    body: string
    link?: string | null
  }
): Promise<number> {
  const { Membership } = await import('../models/Membership.js')
  const members = await Membership.find({
    organizationId,
    role: { $in: ['owner', 'admin', 'teacher', 'examiner'] },
    status: 'active',
  }).select('userId')
  let count = 0
  for (const m of members) {
    try {
      await createNotification({
        userId: m.userId.toString(),
        organizationId,
        type: input.type,
        title: input.title,
        body: input.body,
        link: input.link,
      })
      count += 1
    } catch {
      // best-effort
    }
  }
  return count
}
