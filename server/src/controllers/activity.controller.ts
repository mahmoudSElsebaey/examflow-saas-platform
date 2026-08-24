import type { Response, NextFunction } from 'express'
import { sendSuccess } from '../utils/apiResponse.js'
import type { TenantRequest } from '../middlewares/tenant.js'
import * as activity from '../services/activity.service.js'

function param(req: TenantRequest, key: string): string {
  const v = req.params[key]
  return Array.isArray(v) ? v[0]! : v!
}

function orgId(req: TenantRequest): string {
  return req.organizationId || param(req, 'orgId')
}

export async function listActivity(
  req: TenantRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 50
    const items = await activity.listOrgActivity(orgId(req), req.user!.id, limit)
    return sendSuccess(res, { activity: items })
  } catch (e) {
    next(e)
  }
}
