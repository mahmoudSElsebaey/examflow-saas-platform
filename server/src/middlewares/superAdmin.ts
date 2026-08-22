import type { Response, NextFunction } from 'express'
import { sendError } from '../utils/apiResponse.js'
import type { AuthenticatedRequest } from '../types/auth.js'

export function requireSuperAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user || req.user.role !== 'super_admin') {
    return sendError(res, 'Super admin only', 403, 'FORBIDDEN')
  }
  next()
}
