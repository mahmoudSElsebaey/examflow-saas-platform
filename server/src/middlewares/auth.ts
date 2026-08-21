import type { Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt.js'
import { sendError } from '../utils/apiResponse.js'
import type { AuthenticatedRequest, UserRole } from '../types/auth.js'

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return sendError(res, 'Authentication required', 401, 'UNAUTHORIZED')
  }

  const token = header.slice(7)
  try {
    const payload = verifyAccessToken(token)
    req.user = {
      id: payload.userId,
      email: payload.email,
      firstName: '',
      lastName: '',
      role: payload.role,
      isEmailVerified: false,
    }
    next()
  } catch {
    return sendError(res, 'Invalid or expired token', 401, 'INVALID_TOKEN')
  }
}

export function authorize(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401, 'UNAUTHORIZED')
    }
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return sendError(res, 'Insufficient permissions', 403, 'FORBIDDEN')
    }
    next()
  }
}
