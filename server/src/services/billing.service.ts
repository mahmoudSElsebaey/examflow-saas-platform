import { Organization } from '../models/Organization.js'
import { Membership } from '../models/Membership.js'
import { Exam } from '../models/Exam.js'
import { Question } from '../models/Question.js'
import { QuestionBank } from '../models/QuestionBank.js'
import { User } from '../models/User.js'
import { AppError } from '../middlewares/errorHandler.js'
import { PLAN_LIMITS, limitsFor } from '../config/plans.js'
import type { OrgPlan } from '../types/organization.js'
import { getMembership } from './organization.service.js'
import {
  resolveBillingMode,
  createCheckoutSession,
  createBillingPortalSession,
  cancelSubscriptionIfAny,
  isStripeConfigured,
} from './stripe.service.js'

export function listPlans() {
  const mode = resolveBillingMode()
  return (Object.keys(PLAN_LIMITS) as OrgPlan[]).map((id) => ({
    id,
    limits: PLAN_LIMITS[id],
    priceMonthlyUsd: id === 'free' ? 0 : id === 'professional' ? 49 : 199,
    billingMode: mode,
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
  const mode = resolveBillingMode()
  return {
    plan: org.plan,
    billingMode: mode,
    stripeConfigured: isStripeConfigured(),
    hasStripeCustomer: !!org.stripeCustomerId,
    limits,
    usage: { members, exams, questions, banks },
    canUpgrade: org.plan !== 'enterprise',
  }
}

export type ChangePlanResult = {
  plan?: OrgPlan
  checkoutUrl?: string
  billingMode: 'mock' | 'stripe'
}

export async function changePlan(
  orgId: string,
  actorId: string,
  plan: OrgPlan
): Promise<ChangePlanResult> {
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

  const mode = resolveBillingMode()

  if (plan === 'free') {
    if (mode === 'stripe') {
      await cancelSubscriptionIfAny(orgId)
    }
    org.plan = 'free'
    await org.save()
    return { plan: 'free', billingMode: mode }
  }

  if (mode === 'stripe') {
    const user = await User.findById(actorId)
    if (!user?.email) throw new AppError('User email required for checkout', 400, 'EMAIL_REQUIRED')
    try {
      const { url } = await createCheckoutSession({
        orgId,
        plan: plan as Exclude<OrgPlan, 'free'>,
        customerEmail: user.email,
        orgName: org.name,
      })
      return { checkoutUrl: url, billingMode: 'stripe' }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Stripe checkout failed'
      throw new AppError(msg, 502, 'STRIPE_CHECKOUT_FAILED')
    }
  }

  org.plan = plan
  await org.save()
  return { plan: org.plan, billingMode: 'mock' }
}

export async function openBillingPortal(orgId: string, actorId: string): Promise<{ url: string }> {
  const membership = await Membership.findOne({
    organizationId: orgId,
    userId: actorId,
    status: 'active',
    role: { $in: ['owner', 'admin'] },
  })
  if (!membership) throw new AppError('Insufficient permissions', 403, 'FORBIDDEN')

  if (resolveBillingMode() !== 'stripe') {
    throw new AppError('Billing portal requires Stripe mode', 400, 'STRIPE_REQUIRED')
  }

  try {
    return await createBillingPortalSession(orgId)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Portal failed'
    throw new AppError(msg, 400, 'STRIPE_PORTAL_FAILED')
  }
}

export async function assertWithinLimit(
  orgId: string,
  resource: 'members' | 'exams' | 'questions' | 'banks'
): Promise<void> {
  const org = await Organization.findById(orgId)
  if (!org) throw new AppError('Organization not found', 404, 'ORG_NOT_FOUND')
  const limits = limitsFor(org.plan)

  const map = {
    members: {
      limit: limits.maxMembers,
      count: () =>
        Membership.countDocuments({
          organizationId: orgId,
          status: { $in: ['active', 'invited'] },
        }),
    },
    exams: {
      limit: limits.maxExams,
      count: () =>
        Exam.countDocuments({ organizationId: orgId, status: { $ne: 'archived' } }),
    },
    questions: {
      limit: limits.maxQuestions,
      count: () => Question.countDocuments({ organizationId: orgId, isActive: true }),
    },
    banks: {
      limit: limits.maxBanks,
      count: () => QuestionBank.countDocuments({ organizationId: orgId }),
    },
  } as const

  const entry = map[resource]
  const used = await entry.count()
  if (used >= entry.limit) {
    throw new AppError(
      `Plan limit reached for ${resource} (${entry.limit}). Upgrade your plan.`,
      403,
      'PLAN_LIMIT'
    )
  }
}
