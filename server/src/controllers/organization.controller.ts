import type { Response, NextFunction } from 'express'
import { sendSuccess } from '../utils/apiResponse.js'
import type { AuthenticatedRequest } from '../types/auth.js'
import * as orgService from '../services/organization.service.js'
import * as inviteService from '../services/invite.service.js'

function orgIdParam(req: AuthenticatedRequest): string {
  const id = req.params.orgId
  return Array.isArray(id) ? id[0]! : id!
}

function membershipIdParam(req: AuthenticatedRequest): string {
  const id = req.params.membershipId
  return Array.isArray(id) ? id[0]! : id!
}

export async function createOrg(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const org = await orgService.createOrganization(req.user!.id, req.body)
    return sendSuccess(res, org, 'Organization created', 201)
  } catch (err) {
    next(err)
  }
}

export async function listOrgs(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const orgs = await orgService.listMyOrganizations(req.user!.id)
    return sendSuccess(res, { organizations: orgs })
  } catch (err) {
    next(err)
  }
}

export async function getOrg(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const org = await orgService.getOrganizationForMember(orgIdParam(req), req.user!.id)
    return sendSuccess(res, { organization: org })
  } catch (err) {
    next(err)
  }
}

export async function updateOrg(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const org = await orgService.updateOrganization(
      orgIdParam(req),
      req.user!.id,
      req.body
    )
    return sendSuccess(res, { organization: org }, 'Organization updated')
  } catch (err) {
    next(err)
  }
}

export async function listMembers(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const members = await orgService.listMembers(orgIdParam(req), req.user!.id)
    return sendSuccess(res, { members })
  } catch (err) {
    next(err)
  }
}

export async function inviteMember(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // Prefer pending invite for unknown emails; fall back to direct add
    try {
      const member = await orgService.inviteMember(
        orgIdParam(req),
        req.user!.id,
        req.body
      )
      return sendSuccess(res, { member }, 'Member added', 201)
    } catch (err: any) {
      if (err?.errorCode === 'USER_NOT_FOUND' || err?.code === 'USER_NOT_FOUND') {
        const invite = await inviteService.createPendingInvite(
          orgIdParam(req),
          req.user!.id,
          req.body
        )
        return sendSuccess(res, { invite }, 'Invite sent', 201)
      }
      throw err
    }
  } catch (err) {
    next(err)
  }
}

export async function updateMemberRole(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const member = await orgService.updateMemberRole(
      orgIdParam(req),
      req.user!.id,
      membershipIdParam(req),
      req.body.role
    )
    return sendSuccess(res, { member }, 'Member role updated')
  } catch (err) {
    next(err)
  }
}

export async function removeMember(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await orgService.removeMember(
      orgIdParam(req),
      req.user!.id,
      membershipIdParam(req)
    )
    return sendSuccess(res, result, 'Member removed')
  } catch (err) {
    next(err)
  }
}

export async function setMemberStatus(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const member = await orgService.setMemberStatus(
      orgIdParam(req),
      req.user!.id,
      membershipIdParam(req),
      req.body.status
    )
    return sendSuccess(res, { member }, 'Member status updated')
  } catch (err) {
    next(err)
  }
}

export async function leaveOrg(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await orgService.leaveOrganization(orgIdParam(req), req.user!.id)
    return sendSuccess(res, result, 'Left organization')
  } catch (err) {
    next(err)
  }
}

export async function transferOwnership(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await orgService.transferOwnership(
      orgIdParam(req),
      req.user!.id,
      req.body.newOwnerMembershipId
    )
    return sendSuccess(res, result, 'Ownership transferred')
  } catch (err) {
    next(err)
  }
}

export async function listPendingInvites(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const invites = await inviteService.listPendingInvites(
      orgIdParam(req),
      req.user!.id
    )
    return sendSuccess(res, { invites })
  } catch (err) {
    next(err)
  }
}

export async function acceptInvite(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const token = typeof req.body.token === 'string' ? req.body.token : ''
    const result = await inviteService.acceptInvite(token, req.user!.id)
    return sendSuccess(res, result, 'Invite accepted')
  } catch (err) {
    next(err)
  }
}
