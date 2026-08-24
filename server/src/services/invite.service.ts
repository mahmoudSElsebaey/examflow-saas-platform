import crypto from 'crypto'
import { OrgInvite } from '../models/OrgInvite.js'
import { Membership } from '../models/Membership.js'
import { Organization } from '../models/Organization.js'
import { User } from '../models/User.js'
import { AppError } from '../middlewares/errorHandler.js'
import type { OrgMemberRole } from '../types/organization.js'
import { sendEmail, orgInviteEmail } from './email.service.js'
import { logActivity } from './activity.service.js'
import * as notifService from './notification.service.js'

const INVITE_DAYS = 14

function makeToken(): string {
  return crypto.randomBytes(24).toString('hex')
}

export async function createPendingInvite(
  orgId: string,
  actorId: string,
  data: { email: string; role: Exclude<OrgMemberRole, 'owner'> }
) {
  const actor = await Membership.findOne({
    organizationId: orgId,
    userId: actorId,
    status: 'active',
    role: { $in: ['owner', 'admin'] },
  })
  if (!actor) throw new AppError('Insufficient permissions', 403, 'FORBIDDEN')

  const email = data.email.toLowerCase().trim()
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    throw new AppError('User already registered — use direct invite', 409, 'USER_EXISTS')
  }

  await OrgInvite.updateMany(
    { organizationId: orgId, email, status: 'pending' },
    { $set: { status: 'revoked' } }
  )

  const token = makeToken()
  const expiresAt = new Date(Date.now() + INVITE_DAYS * 24 * 60 * 60 * 1000)

  const invite = await OrgInvite.create({
    organizationId: orgId,
    email,
    role: data.role,
    token,
    invitedBy: actorId,
    status: 'pending',
    expiresAt,
  })

  const org = await Organization.findById(orgId)
  const clientBase =
    process.env.CLIENT_URL || process.env.APP_URL || 'http://localhost:5173'
  const acceptLink = `${clientBase}/register?invite=${token}`

  await sendEmail(
    orgInviteEmail(email, org?.name || 'Organization', data.role, acceptLink)
  )

  await logActivity({
    organizationId: orgId,
    actorId,
    action: 'member.invited',
    summary: `Pending invite sent to ${email} as ${data.role}`,
    entityType: 'invite',
    entityId: invite.id,
    meta: { email, role: data.role, pending: true },
  })

  return {
    id: invite.id,
    email: invite.email,
    role: invite.role,
    status: invite.status,
    expiresAt: invite.expiresAt.toISOString(),
  }
}

export async function listPendingInvites(orgId: string, userId: string) {
  const membership = await Membership.findOne({
    organizationId: orgId,
    userId,
    status: 'active',
    role: { $in: ['owner', 'admin'] },
  })
  if (!membership) throw new AppError('Insufficient permissions', 403, 'FORBIDDEN')

  const invites = await OrgInvite.find({
    organizationId: orgId,
    status: 'pending',
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 })

  return invites.map((i) => ({
    id: i.id,
    email: i.email,
    role: i.role,
    status: i.status,
    expiresAt: i.expiresAt.toISOString(),
    createdAt: i.createdAt.toISOString(),
  }))
}

export async function acceptInvite(token: string, userId: string) {
  const invite = await OrgInvite.findOne({ token, status: 'pending' })
  if (!invite) throw new AppError('Invite not found or already used', 404, 'INVITE_NOT_FOUND')

  if (invite.expiresAt.getTime() < Date.now()) {
    invite.status = 'expired'
    await invite.save()
    throw new AppError('Invite expired', 410, 'INVITE_EXPIRED')
  }

  const user = await User.findById(userId)
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND')

  if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
    throw new AppError(
      'This invite was sent to a different email address',
      403,
      'INVITE_EMAIL_MISMATCH'
    )
  }

  const existing = await Membership.findOne({
    organizationId: invite.organizationId,
    userId,
  })
  if (existing) {
    invite.status = 'accepted'
    await invite.save()
    return {
      organizationId: invite.organizationId.toString(),
      role: existing.role,
      alreadyMember: true,
    }
  }

  await Membership.create({
    organizationId: invite.organizationId,
    userId,
    role: invite.role,
    status: 'active',
    invitedBy: invite.invitedBy,
  })

  invite.status = 'accepted'
  await invite.save()

  const org = await Organization.findById(invite.organizationId)
  try {
    await notifService.createNotification({
      userId,
      organizationId: invite.organizationId.toString(),
      type: 'org_invite',
      title: 'Welcome',
      body: `You joined "${org?.name || 'Organization'}" as ${invite.role}.`,
      link: `/app/organizations/${invite.organizationId}`,
    })
  } catch {
    // non-blocking
  }

  await logActivity({
    organizationId: invite.organizationId.toString(),
    actorId: userId,
    action: 'member.invited',
    summary: `${user.email} accepted invite as ${invite.role}`,
    entityType: 'invite',
    entityId: invite.id,
  })

  return {
    organizationId: invite.organizationId.toString(),
    role: invite.role,
    alreadyMember: false,
  }
}
