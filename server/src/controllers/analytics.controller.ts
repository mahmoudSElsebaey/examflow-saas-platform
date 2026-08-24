import type { Response, NextFunction } from 'express'
import { sendSuccess } from '../utils/apiResponse.js'
import type { TenantRequest } from '../middlewares/tenant.js'
import * as analytics from '../services/analytics.service.js'
import * as exportService from '../services/export.service.js'

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
    const data = await analytics.getExamAnalytics(orgId(req), param(req, 'examId'))
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
    const data = await analytics.getStudentHistory(req.user!.id, orgId(req))
    return sendSuccess(res, { analytics: data })
  } catch (e) {
    next(e)
  }
}

export async function exportOrgAttemptsCsv(
  req: TenantRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { filename, csv } = await exportService.exportOrgAttemptsCsv(orgId(req))
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    // BOM for Excel UTF-8
    return res.send('\uFEFF' + csv)
  } catch (e) {
    next(e)
  }
}

export async function exportExamAttemptsCsv(
  req: TenantRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const { filename, csv } = await exportService.exportExamAttemptsCsv(
      orgId(req),
      param(req, 'examId')
    )
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    return res.send('\uFEFF' + csv)
  } catch (e) {
    next(e)
  }
}
