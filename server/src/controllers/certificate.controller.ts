import type { Request, Response, NextFunction } from 'express'
import { sendSuccess } from '../utils/apiResponse.js'
import type { TenantRequest } from '../middlewares/tenant.js'
import * as certService from '../services/certificate.service.js'

function param(req: TenantRequest, key: string): string {
  const v = req.params[key]
  return Array.isArray(v) ? v[0]! : v!
}

function orgId(req: TenantRequest): string {
  return req.organizationId || param(req, 'orgId')
}

const staffRoles = new Set(['owner', 'admin', 'teacher', 'examiner'])

export async function issue(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const isStaff = staffRoles.has(req.membershipRole || '')
    const cert = await certService.issueCertificateForAttempt(
      orgId(req),
      param(req, 'attemptId'),
      req.user!.id,
      isStaff
    )
    return sendSuccess(res, { certificate: cert }, 'Certificate issued', 201)
  } catch (e) {
    next(e)
  }
}

export async function list(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const isStaff = staffRoles.has(req.membershipRole || '')
    const certificates = await certService.listCertificates(
      orgId(req),
      req.user!.id,
      isStaff
    )
    return sendSuccess(res, { certificates })
  } catch (e) {
    next(e)
  }
}

export async function getOne(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const isStaff = staffRoles.has(req.membershipRole || '')
    const certificate = await certService.getCertificate(
      orgId(req),
      param(req, 'certId'),
      req.user!.id,
      isStaff
    )
    return sendSuccess(res, { certificate })
  } catch (e) {
    next(e)
  }
}

export async function verifyPublic(req: Request, res: Response, next: NextFunction) {
  try {
    const code = String(req.params.code || '')
    const certificate = await certService.getCertificateByCode(code)
    return sendSuccess(res, { certificate, valid: true })
  } catch (e) {
    next(e)
  }
}
