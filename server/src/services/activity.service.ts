import { ActivityLog, type ActivityAction } from '../models/ActivityLog.js'
import { Membership } from '../models/Membership.js'
import { User } from '../models/User.js'
import { AppError } from '../middlewares/errorHandler.js'

export interface ActivityDTO {
  id: string
  action: string
  summary: string
  entityType?: string | null
  entityId?: string | null
  meta?: Record<string, unknown> | null
  actorId: string
  actorName?: string
  createdAt: string
}

export async function logActivity(input: {
  organizationId: string
  actorId: string
  action: ActivityAction
  summary: string
  entityType?: string
  entityId?: string
  meta?: Record<string, unknown>
}): Promise<void> {
  try {
    await ActivityLog.create({
      organizationId: input.organizationId,
      actorId: input.actorId,
      action: input.action,
      summary: input.summary.slice(0, 500),
      entityType: input.entityType ?? null,
      entityId: input.entityId ?? null,
      meta: input.meta ?? null,
    })
  } catch {
    // never block primary flows
  }
}

export async function listOrgActivity(
  orgId: string,
  userId: string,
  limit = 50
): Promise<ActivityDTO[]> {
  const membership = await Membership.findOne({
    organizationId: orgId,
    userId,
    status: 'active',
    role: { $in: ['owner', 'admin', 'teacher', 'examiner'] },
  })
  if (!membership) {
    throw new AppError('Insufficient permissions', 403, 'FORBIDDEN')
  }

  const rows = await ActivityLog.find({ organizationId: orgId })
    .sort({ createdAt: -1 })
    .limit(Math.min(limit, 100))

  const actorIds = [...new Set(rows.map((r) => r.actorId.toString()))]
  const users = await User.find({ _id: { $in: actorIds } }).select('firstName lastName')
  const nameMap = new Map(
    users.map((u) => [u.id, `${u.firstName} ${u.lastName}`.trim()])
  )

  return rows.map((r) => ({
    id: r.id,
    action: r.action,
    summary: r.summary,
    entityType: r.entityType ?? null,
    entityId: r.entityId ?? null,
    meta: (r.meta as Record<string, unknown>) ?? null,
    actorId: r.actorId.toString(),
    actorName: nameMap.get(r.actorId.toString()),
    createdAt: r.createdAt.toISOString(),
  }))
}
