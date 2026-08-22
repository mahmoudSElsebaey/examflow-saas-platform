import type { OrgPlan } from '../types/organization.js'

export type PlanLimits = {
  maxMembers: number
  maxExams: number
  maxQuestions: number
  maxBanks: number
  analytics: boolean
  certificates: boolean
  whiteLabel: boolean
}

export const PLAN_LIMITS: Record<OrgPlan, PlanLimits> = {
  free: {
    maxMembers: 10,
    maxExams: 5,
    maxQuestions: 100,
    maxBanks: 3,
    analytics: true,
    certificates: true,
    whiteLabel: false,
  },
  professional: {
    maxMembers: 100,
    maxExams: 100,
    maxQuestions: 5000,
    maxBanks: 50,
    analytics: true,
    certificates: true,
    whiteLabel: true,
  },
  enterprise: {
    maxMembers: 10000,
    maxExams: 10000,
    maxQuestions: 100000,
    maxBanks: 1000,
    analytics: true,
    certificates: true,
    whiteLabel: true,
  },
}

export function limitsFor(plan: OrgPlan | string | undefined): PlanLimits {
  if (plan === 'professional' || plan === 'enterprise') return PLAN_LIMITS[plan]
  return PLAN_LIMITS.free
}
