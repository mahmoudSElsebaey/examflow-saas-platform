import { Notification } from '../models/Notification.js'
import type { NotificationType } from '../models/Notification.js'
import { AppError } from '../middlewares/errorHandler.js'

export interface NotificationDTO {
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
