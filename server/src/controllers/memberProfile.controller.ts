import type { Response, NextFunction } from 'express'
import { sendSuccess } from '../utils/apiResponse.js'
import type { AuthenticatedRequest } from '../types/auth.js'
import * as profile from '../services/memberProfile.service.js'

function param(req: AuthenticatedRequest, key: string): string {
  const v = req.params[key]
  return Array.isArray(v) ? v[0]! : v!
}

export async function getMemberProfile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await profile.getMemberProfile(
      param(req, 'orgId'),
      req.user!.id,
      param(req, 'userId')
    )
    return sendSuccess(res, { profile: data })
  } catch (e) {
    next(e)
  }
}
