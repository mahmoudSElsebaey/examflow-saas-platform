import type { Response, NextFunction } from 'express'
import { sendSuccess } from '../utils/apiResponse.js'
import type { TenantRequest } from '../middlewares/tenant.js'
import * as progress from '../services/progress.service.js'

function param(req: TenantRequest, key: string): string {
  const v = req.params[key]
  return Array.isArray(v) ? v[0]! : v!
}

function orgId(req: TenantRequest): string {
  return req.organizationId || param(req, 'orgId')
}

export async function markViewed(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const data = await progress.markLessonViewed(
      orgId(req),
      req.user!.id,
      param(req, 'lessonId')
    )
    return sendSuccess(res, { progress: data })
  } catch (e) {
    next(e)
  }
}

export async function markCompleted(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const data = await progress.markLessonCompleted(
      orgId(req),
      req.user!.id,
      param(req, 'lessonId')
    )
    return sendSuccess(res, { progress: data })
  } catch (e) {
    next(e)
  }
}

export async function myProgress(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const data = await progress.listMyProgress(orgId(req), req.user!.id)
    return sendSuccess(res, data)
  } catch (e) {
    next(e)
  }
}
