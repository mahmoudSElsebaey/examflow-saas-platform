import type { Response, NextFunction } from 'express'
import { sendSuccess } from '../utils/apiResponse.js'
import type { TenantRequest } from '../middlewares/tenant.js'
import * as analytics from '../services/analytics.service.js'

function param(req: TenantRequest, key: string): string {
  const v = req.params[key]
  return Array.isArray(v) ? v[0]! : v!
}

function orgId(req: TenantRequest): string {
  return req.organizationId || param(req, 'orgId')
}

export async function orgAnalytics(
  req: TenantRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await analytics.getOrgAnalytics(orgId(req))
    return sendSuccess(res, { analytics: data })
  } catch (e) {
    next(e)
  }
}

export async function examAnalytics(
  req: TenantRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await analytics.getExamAnalytics(
      orgId(req),
      param(req, 'examId')
    )

    return sendSuccess(res, { analytics: data })
  } catch (e) {
    next(e)
  }
}

export async function studentHistory(
  req: TenantRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await analytics.getStudentHistory(
      req.user!.id,
      orgId(req)
    )

    return sendSuccess(res, { analytics: data })
  } catch (e) {
    next(e)
  }
}