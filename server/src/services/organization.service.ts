import { Organization } from '../models/Organization.js'
import { Membership } from '../models/Membership.js'
import { User } from '../models/User.js'
import { AppError } from '../middlewares/errorHandler.js'
import type { OrganizationDTO, MemberDTO, OrgMemberRole } from '../types/organization.js'
import { sendEmail, orgInviteEmail } from './email.service.js'
import * as notifService from './notification.service.js'
import { logActivity } from './activity.service.js'

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
}

function toOrgDTO(
  org: InstanceType<typeof Organization>,
  myRole?: OrgMemberRole
): OrganizationDTO {
  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    description: org.description ?? null,
    ownerId: org.ownerId.toString(),
    plan: org.plan,
    isActive: org.isActive,
    branding: {
      logoUrl: org.branding?.logoUrl ?? null,
      primaryColor: org.branding?.primaryColor ?? null,
    },
    createdAt: org.createdAt.toISOString(),
    updatedAt: org.updatedAt.toISOString(),
    myRole,
  }
}

function toMemberDTO(
  m: InstanceType<typeof Membership>,
  u?: { email: string; firstName: string; lastName: string } | null
): MemberDTO {
  return {
    id: m.id,
    userId: m.userId.toString(),
    email: u?.email ?? '',
    firstName: u?.firstName ?? '',
    lastName: u?.lastName ?? '',
    role: m.role,
    status: m.status,
    joinedAt: m.createdAt.toISOString(),
  }
}

export async function getMembership(orgId: string, userId: string) {
  return Membership.findOne({
    organizationId: orgId,
    userId,
    status: { $in: ['active', 'invited'] },
  })
}

export async function createOrganization(
  userId: string,
  data: { name: string; slug?: string; description?: string }
): Promise<OrganizationDTO> {
  let slug = (data.slug || slugify(data.name)).toLowerCase()
  if (!slug) slug = `org-${Date.now().toString(36)}`

  const exists = await Organization.findOne({ slug })
  if (exists) {
    slug = `${slug}-${Date.now().toString(36).slice(-4)}`
  }

  const org = await Organization.create({
    name: data.name.trim(),
    slug,
    description: data.description?.trim() || null,
    ownerId: userId,
    plan: 'free',
    branding: { logoUrl: null, primaryColor: null },
  })

  await Membership.create({
    organizationId: org.id,
    userId,
    role: 'owner',
    status: 'active',
  })

  return toOrgDTO(org, 'owner')
}

export async function listOrganizations(userId: string): Promise<OrganizationDTO[]> {
  const memberships = await Membership.find({
    userId,
    status: { $in: ['active', 'invited'] },
  })
  const orgIds = memberships.map((m) => m.organizationId)
  const orgs = await Organization.find({
    _id: { $in: orgIds },
    isActive: true,
  }).sort({ name: 1 })

  const roleMap = new Map(
    memberships.map((m) => [m.organizationId.toString(), m.role as OrgMemberRole])
  )

  return orgs.map((org) => toOrgDTO(org, roleMap.get(org.id)))
}

export const listMyOrganizations = listOrganizations

export async function getOrganization(
  orgId: string,
  userId: string
): Promise<OrganizationDTO> {
  const membership = await getMembership(orgId, userId)
  if (!membership) throw new AppError('Organization not found', 404, 'ORG_NOT_FOUND')

  const org = await Organization.findById(orgId)
  if (!org || !org.isActive) throw new AppError('Organization not found', 404, 'ORG_NOT_FOUND')

  return toOrgDTO(org, membership.role)
}

export const getOrganizationForMember = getOrganization

export async function updateOrganization(
  orgId: string,
  userId: string,
  data: {
    name?: string
    description?: string | null
    primaryColor?: string | null
    logoUrl?: string | null
  }
): Promise<OrganizationDTO> {
  const membership = await Membership.findOne({
    organizationId: orgId,
    userId,
    status: 'active',
    role: { $in: ['owner', 'admin'] },
  })
  if (!membership) throw new AppError('Insufficient permissions', 403, 'FORBIDDEN')

  const org = await Organization.findById(orgId)
  if (!org || !org.isActive) throw new AppError('Organization not found', 404, 'ORG_NOT_FOUND')

  if (data.name !== undefined) org.name = data.name.trim()
  if (data.description !== undefined) org.description = data.description

  const branding = {
    logoUrl: org.branding?.logoUrl ?? null,
    primaryColor: org.branding?.primaryColor ?? null,
  }
  if (data.primaryColor !== undefined) branding.primaryColor = data.primaryColor
  if (data.logoUrl !== undefined) branding.logoUrl = data.logoUrl
  if (data.primaryColor !== undefined || data.logoUrl !== undefined) {
    org.branding = branding
  }

  await org.save()

  await logActivity({
    organizationId: orgId,
    actorId: userId,
    action: 'org.updated',
    summary: `Organization settings updated (${org.name})`,
    entityType: 'organization',
    entityId: orgId,
  })

  return toOrgDTO(org, membership.role)
}

export async function listMembers(orgId: string, userId: string): Promise<MemberDTO[]> {
  const membership = await Membership.findOne({
    organizationId: orgId,
    userId,
    status: 'active',
  })
  if (!membership) throw new AppError('Organization not found', 404, 'ORG_NOT_FOUND')

  const members = await Membership.find({ organizationId: orgId }).sort({ createdAt: 1 })
  const userIds = members.map((m) => m.userId)
  const users = await User.find({ _id: { $in: userIds } }).select(
    'email firstName lastName'
  )
  const userMap = new Map(users.map((u) => [u.id, u]))

  return members.map((m) => {
    const u = userMap.get(m.userId.toString())
    return toMemberDTO(m, u)
  })
}

export async function inviteMember(
  orgId: string,
  actorId: string,
  data: { email: string; role: Exclude<OrgMemberRole, 'owner'> }
): Promise<MemberDTO> {
  const actor = await Membership.findOne({
    organizationId: orgId,
    userId: actorId,
    status: 'active',
    role: { $in: ['owner', 'admin'] },
  })
  if (!actor) throw new AppError('Insufficient permissions', 403, 'FORBIDDEN')

  const user = await User.findOne({ email: data.email.toLowerCase().trim() })
  if (!user) {
    throw new AppError('User not found. They must register first.', 404, 'USER_NOT_FOUND')
  }

  const existing = await Membership.findOne({
    organizationId: orgId,
    userId: user.id,
  })
  if (existing) {
    if (existing.status === 'suspended') {
      existing.status = 'active'
      existing.role = data.role
      await existing.save()
      await logActivity({
        organizationId: orgId,
        actorId,
        action: 'member.reactivated',
        summary: `Reactivated ${user.email} as ${data.role}`,
        entityType: 'membership',
        entityId: existing.id,
        meta: { email: user.email, role: data.role },
      })
      return toMemberDTO(existing, user)
    }
    throw new AppError('User is already a member', 409, 'ALREADY_MEMBER')
  }

  const membership = await Membership.create({
    organizationId: orgId,
    userId: user.id,
    role: data.role,
    status: 'active',
    invitedBy: actorId,
  })

  const org = await Organization.findById(orgId)
  await sendEmail(
    orgInviteEmail(user.email, org?.name || 'Organization', membership.role)
  )
  try {
    await notifService.createNotification({
      userId: user.id,
      organizationId: orgId,
      type: 'org_invite',
      title: 'Organization invite',
      body: `You were added to "${org?.name || 'Organization'}" as ${membership.role}.`,
      link: `/app/organizations/${orgId}`,
    })
  } catch {
    // non-blocking
  }

  await logActivity({
    organizationId: orgId,
    actorId,
    action: 'member.invited',
    summary: `Added ${user.email} as ${data.role}`,
    entityType: 'membership',
    entityId: membership.id,
    meta: { email: user.email, role: data.role },
  })

  return toMemberDTO(membership, user)
}

export async function updateMemberRole(
  orgId: string,
  actorId: string,
  membershipId: string,
  role: Exclude<OrgMemberRole, 'owner'>
): Promise<MemberDTO> {
  const actor = await Membership.findOne({
    organizationId: orgId,
    userId: actorId,
    status: 'active',
    role: { $in: ['owner', 'admin'] },
  })
  if (!actor) throw new AppError('Insufficient permissions', 403, 'FORBIDDEN')

  const target = await Membership.findOne({
    _id: membershipId,
    organizationId: orgId,
  })
  if (!target) throw new AppError('Member not found', 404, 'MEMBER_NOT_FOUND')

  if (target.role === 'owner') {
    throw new AppError('Cannot change the owner role', 400, 'CANNOT_CHANGE_OWNER')
  }

  if (target.userId.toString() === actorId && actor.role !== 'owner') {
    throw new AppError('Admins cannot change their own role', 400, 'CANNOT_SELF_CHANGE')
  }

  const prevRole = target.role
  target.role = role
  await target.save()

  const user = await User.findById(target.userId).select('email firstName lastName')
  await logActivity({
    organizationId: orgId,
    actorId,
    action: 'member.role_changed',
    summary: `Changed role of ${user?.email || target.userId} from ${prevRole} to ${role}`,
    entityType: 'membership',
    entityId: target.id,
    meta: { from: prevRole, to: role, email: user?.email },
  })

  return toMemberDTO(target, user)
}

export async function removeMember(
  orgId: string,
  actorId: string,
  membershipId: string
): Promise<{ removed: true }> {
  const actor = await Membership.findOne({
    organizationId: orgId,
    userId: actorId,
    status: 'active',
    role: { $in: ['owner', 'admin'] },
  })
  if (!actor) throw new AppError('Insufficient permissions', 403, 'FORBIDDEN')

  const target = await Membership.findOne({
    _id: membershipId,
    organizationId: orgId,
  })
  if (!target) throw new AppError('Member not found', 404, 'MEMBER_NOT_FOUND')

  if (target.role === 'owner') {
    throw new AppError('Cannot remove the organization owner', 400, 'CANNOT_REMOVE_OWNER')
  }

  if (target.userId.toString() === actorId) {
    throw new AppError('Cannot remove yourself', 400, 'CANNOT_REMOVE_SELF')
  }

  const user = await User.findById(target.userId).select('email firstName lastName')
  const email = user?.email || target.userId.toString()
  await target.deleteOne()

  await logActivity({
    organizationId: orgId,
    actorId,
    action: 'member.removed',
    summary: `Removed member ${email}`,
    entityType: 'membership',
    entityId: membershipId,
    meta: { email },
  })

  return { removed: true }
}

export async function setMemberStatus(
  orgId: string,
  actorId: string,
  membershipId: string,
  status: 'active' | 'suspended'
): Promise<MemberDTO> {
  const actor = await Membership.findOne({
    organizationId: orgId,
    userId: actorId,
    status: 'active',
    role: { $in: ['owner', 'admin'] },
  })
  if (!actor) throw new AppError('Insufficient permissions', 403, 'FORBIDDEN')

  const target = await Membership.findOne({
    _id: membershipId,
    organizationId: orgId,
  })
  if (!target) throw new AppError('Member not found', 404, 'MEMBER_NOT_FOUND')

  if (target.role === 'owner') {
    throw new AppError('Cannot suspend the organization owner', 400, 'CANNOT_SUSPEND_OWNER')
  }

  if (target.userId.toString() === actorId) {
    throw new AppError('Cannot suspend yourself', 400, 'CANNOT_SUSPEND_SELF')
  }

  target.status = status
  await target.save()

  const user = await User.findById(target.userId).select('email firstName lastName')
  await logActivity({
    organizationId: orgId,
    actorId,
    action: status === 'suspended' ? 'member.suspended' : 'member.reactivated',
    summary:
      status === 'suspended'
        ? `Suspended ${user?.email || target.userId}`
        : `Reactivated ${user?.email || target.userId}`,
    entityType: 'membership',
    entityId: target.id,
    meta: { email: user?.email, status },
  })

  return toMemberDTO(target, user)
}
