import type { Response, NextFunction } from 'express'
import { sendSuccess } from '../utils/apiResponse.js'
import type { AuthenticatedRequest } from '../types/auth.js'
import * as admin from '../services/admin.service.js'

export async function metrics(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const data = await admin.platformMetrics()
    return sendSuccess(res, data)
  } catch (e) {
    next(e)
  }
}

export async function listOrgs(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const organizations = await admin.listOrganizationsAdmin()
    return sendSuccess(res, { organizations })
  } catch (e) {
    next(e)
  }
}

export async function suspendOrg(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.orgId) ? req.params.orgId[0]! : req.params.orgId!
    const organization = await admin.setOrganizationActive(id, false)
    return sendSuccess(res, { organization }, 'Organization suspended')
  } catch (e) {
    next(e)
  }
}

export async function activateOrg(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.orgId) ? req.params.orgId[0]! : req.params.orgId!
    const organization = await admin.setOrganizationActive(id, true)
    return sendSuccess(res, { organization }, 'Organization activated')
  } catch (e) {
    next(e)
  }
}

export async function listUsers(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const users = await admin.listUsersAdmin()
    return sendSuccess(res, { users })
  } catch (e) {
    next(e)
  }
}

export async function deactivateUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.userId) ? req.params.userId[0]! : req.params.userId!
    const user = await admin.setUserActive(id, false)
    return sendSuccess(res, { user }, 'User deactivated')
  } catch (e) {
    next(e)
  }
}

export async function activateUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const id = Array.isArray(req.params.userId) ? req.params.userId[0]! : req.params.userId!
    const user = await admin.setUserActive(id, true)
    return sendSuccess(res, { user }, 'User activated')
  } catch (e) {
    next(e)
  }
}
