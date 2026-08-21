import type { Response, NextFunction } from 'express'
import { sendError } from '../utils/apiResponse.js'
import { getMembership } from '../services/organization.service.js'
import type { AuthenticatedRequest } from '../types/auth.js'
import type { OrgMemberRole } from '../types/organization.js'

export interface TenantRequest extends AuthenticatedRequest {
  organizationId?: string
  membershipRole?: OrgMemberRole
}

function paramId(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value
}

/** Requires authenticated user to be an active member of :orgId */
export async function requireOrgMember(
  req: TenantRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401, 'UNAUTHORIZED')
    }
    const orgId = paramId(req.params.orgId)
    if (!orgId) {
      return sendError(res, 'Organization id required', 400, 'BAD_REQUEST')
    }

    const membership = await getMembership(orgId, req.user.id)
    if (!membership) {
      return sendError(res, 'Not a member of this organization', 403, 'FORBIDDEN')
    }

    req.organizationId = orgId
    req.membershipRole = membership.role
    next()
  } catch {
    return sendError(res, 'Tenant check failed', 500, 'INTERNAL_ERROR')
  }
}

export function requireOrgRoles(...roles: OrgMemberRole[]) {
  return (req: TenantRequest, res: Response, next: NextFunction) => {
    if (!req.membershipRole || !roles.includes(req.membershipRole)) {
      return sendError(res, 'Insufficient organization permissions', 403, 'FORBIDDEN')
    }
    next()
  }
}
