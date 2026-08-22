import { Organization } from '../models/Organization.js'
import { User } from '../models/User.js'
import { Exam } from '../models/Exam.js'
import { ExamAttempt } from '../models/ExamAttempt.js'
import { AppError } from '../middlewares/errorHandler.js'

export async function platformMetrics() {
  const [orgs, users, exams, attempts, activeOrgs] = await Promise.all([
    Organization.countDocuments(),
    User.countDocuments({ isActive: true }),
    Exam.countDocuments({ status: { $ne: 'archived' } }),
    ExamAttempt.countDocuments(),
    Organization.countDocuments({ isActive: true }),
  ])
  return {
    organizations: orgs,
    activeOrganizations: activeOrgs,
    users,
    exams,
    attempts,
  }
}

export async function listOrganizationsAdmin(limit = 50) {
  const orgs = await Organization.find().sort({ createdAt: -1 }).limit(limit)
  const ownerIds = [...new Set(orgs.map((o) => o.ownerId.toString()))]
  const owners = await User.find({ _id: { $in: ownerIds } }).select('email firstName lastName')
  const ownerMap = new Map(owners.map((u) => [u.id, u]))

  return orgs.map((o) => {
    const owner = ownerMap.get(o.ownerId.toString())
    return {
      id: o.id,
      name: o.name,
      slug: o.slug,
      plan: o.plan,
      isActive: o.isActive,
      ownerEmail: owner?.email ?? null,
      ownerName: owner ? `${owner.firstName} ${owner.lastName}`.trim() : null,
      createdAt: o.createdAt.toISOString(),
    }
  })
}

export async function setOrganizationActive(orgId: string, isActive: boolean) {
  const org = await Organization.findById(orgId)
  if (!org) throw new AppError('Organization not found', 404, 'ORG_NOT_FOUND')
  org.isActive = isActive
  await org.save()
  return {
    id: org.id,
    name: org.name,
    isActive: org.isActive,
  }
}

export async function listUsersAdmin(limit = 50) {
  const users = await User.find().sort({ createdAt: -1 }).limit(limit).select(
    'email firstName lastName role isActive isEmailVerified createdAt'
  )
  return users.map((u) => ({
    id: u.id,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    role: u.role,
    isActive: u.isActive,
    isEmailVerified: u.isEmailVerified,
    createdAt: u.createdAt.toISOString(),
  }))
}

export async function setUserActive(userId: string, isActive: boolean) {
  const user = await User.findById(userId)
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND')
  if (user.role === 'super_admin' && !isActive) {
    throw new AppError('Cannot deactivate super admin', 400, 'FORBIDDEN')
  }
  user.isActive = isActive
  await user.save()
  return { id: user.id, email: user.email, isActive: user.isActive }
}
