import type { Response, NextFunction } from 'express'
import { sendSuccess } from '../utils/apiResponse.js'
import type { TenantRequest } from '../middlewares/tenant.js'
import type { AuthenticatedRequest } from '../types/auth.js'
import * as billing from '../services/billing.service.js'

export async function listPlans(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    return sendSuccess(res, { plans: billing.listPlans() })
  } catch (e) {
    next(e)
  }
}

export async function getOrgBilling(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const orgId = req.organizationId || (req.params.orgId as string)
    const data = await billing.getOrgBilling(orgId, req.user!.id)
    return sendSuccess(res, data)
  } catch (e) {
    next(e)
  }
}

export async function changePlan(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const orgId = req.organizationId || (req.params.orgId as string)
    const result = await billing.changePlan(orgId, req.user!.id, req.body.plan)
    return sendSuccess(res, result, 'Plan updated (mock billing)')
  } catch (e) {
    next(e)
  }
}
