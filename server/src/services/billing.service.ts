import { Organization } from '../models/Organization.js'
import { Membership } from '../models/Membership.js'
import { Exam } from '../models/Exam.js'
import { Question } from '../models/Question.js'
import { QuestionBank } from '../models/QuestionBank.js'
import { AppError } from '../middlewares/errorHandler.js'
import { PLAN_LIMITS, limitsFor } from '../config/plans.js'
import type { OrgPlan } from '../types/organization.js'
import { getMembership } from './organization.service.js'

export function listPlans() {
  return (Object.keys(PLAN_LIMITS) as OrgPlan[]).map((id) => ({
    id,
    limits: PLAN_LIMITS[id],
    priceMonthlyUsd: id === 'free' ? 0 : id === 'professional' ? 49 : 199,
    billingMode: 'mock' as const,
  }))
}

export async function getOrgBilling(orgId: string, userId: string) {
  const membership = await getMembership(orgId, userId)
  if (!membership) throw new AppError('Forbidden', 403, 'FORBIDDEN')

  const org = await Organization.findById(orgId)
  if (!org) throw new AppError('Organization not found', 404, 'ORG_NOT_FOUND')

  const [members, exams, questions, banks] = await Promise.all([
    Membership.countDocuments({ organizationId: orgId, status: { $in: ['active', 'invited'] } }),
    Exam.countDocuments({ organizationId: orgId, status: { $ne: 'archived' } }),
    Question.countDocuments({ organizationId: orgId, isActive: true }),
    QuestionBank.countDocuments({ organizationId: orgId }),
  ])

  const limits = limitsFor(org.plan)
  return {
    plan: org.plan,
    billingMode: 'mock' as const,
    limits,
    usage: { members, exams, questions, banks },
    canUpgrade: org.plan !== 'enterprise',
  }
}

export async function changePlan(
  orgId: string,
  actorId: string,
  plan: OrgPlan
): Promise<{ plan: OrgPlan }> {
  const membership = await Membership.findOne({
    organizationId: orgId,
    userId: actorId,
    status: 'active',
    role: { $in: ['owner', 'admin'] },
  })
  if (!membership) throw new AppError('Insufficient permissions', 403, 'FORBIDDEN')

  if (!['free', 'professional', 'enterprise'].includes(plan)) {
    throw new AppError('Invalid plan', 400, 'INVALID_PLAN')
  }

  const org = await Organization.findById(orgId)
  if (!org || !org.isActive) throw new AppError('Organization not found', 404, 'ORG_NOT_FOUND')

  org.plan = plan
  await org.save()
  return { plan: org.plan }
}

export async function assertWithinLimit(
  orgId: string,
  resource: 'members' | 'exams' | 'questions' | 'banks'
): Promise<void> {
  const org = await Organization.findById(orgId)
  if (!org) throw new AppError('Organization not found', 404, 'ORG_NOT_FOUND')
  if (!org.isActive) throw new AppError('Organization is suspended', 403, 'ORG_SUSPENDED')

  const limits = limitsFor(org.plan)
  let count = 0
  let max = 0
  switch (resource) {
    case 'members':
      count = await Membership.countDocuments({
        organizationId: orgId,
        status: { $in: ['active', 'invited'] },
      })
      max = limits.maxMembers
      break
    case 'exams':
      count = await Exam.countDocuments({ organizationId: orgId, status: { $ne: 'archived' } })
      max = limits.maxExams
      break
    case 'questions':
      count = await Question.countDocuments({ organizationId: orgId, isActive: true })
      max = limits.maxQuestions
      break
    case 'banks':
      count = await QuestionBank.countDocuments({ organizationId: orgId })
      max = limits.maxBanks
      break
  }
  if (count >= max) {
    throw new AppError(
      `Plan limit reached for ${resource} (${count}/${max}). Upgrade your plan.`,
      403,
      'PLAN_LIMIT'
    )
  }
}
