import type { Response, NextFunction } from 'express'
import { sendSuccess } from '../utils/apiResponse.js'
import type { AuthenticatedRequest } from '../types/auth.js'
import * as orgService from '../services/organization.service.js'

function orgIdParam(req: AuthenticatedRequest): string {
  const id = req.params.orgId
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
    const member = await orgService.inviteMember(
      orgIdParam(req),
      req.user!.id,
      req.body
    )
    return sendSuccess(res, { member }, 'Member added', 201)
  } catch (err) {
    next(err)
  }
}
