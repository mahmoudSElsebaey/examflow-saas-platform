import type { Response, NextFunction } from 'express'
import { sendSuccess } from '../utils/apiResponse.js'
import type { TenantRequest } from '../middlewares/tenant.js'
import * as examService from '../services/exam.service.js'

function param(req: TenantRequest, key: string): string {
  const v = req.params[key]
  return Array.isArray(v) ? v[0]! : v!
}

function orgId(req: TenantRequest): string {
  return req.organizationId || param(req, 'orgId')
}

const staffRoles = new Set(['owner', 'admin', 'teacher', 'examiner'])

export async function listExams(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const data = await examService.listExams(orgId(req))
    return sendSuccess(res, { exams: data })
  } catch (e) {
    next(e)
  }
}

export async function getExam(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const exam = await examService.getExam(orgId(req), param(req, 'examId'))
    return sendSuccess(res, { exam })
  } catch (e) {
    next(e)
  }
}

export async function createExam(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const exam = await examService.createExam(orgId(req), req.user!.id, req.body)
    return sendSuccess(res, { exam }, 'Exam created', 201)
  } catch (e) {
    next(e)
  }
}

export async function updateExam(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const exam = await examService.updateExam(
      orgId(req),
      param(req, 'examId'),
      req.body
    )
    return sendSuccess(res, { exam }, 'Exam updated')
  } catch (e) {
    next(e)
  }
}

export async function publishExam(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const exam = await examService.publishExam(orgId(req), param(req, 'examId'))
    return sendSuccess(res, { exam }, 'Exam published')
  } catch (e) {
    next(e)
  }
}

export async function archiveExam(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    await examService.archiveExam(orgId(req), param(req, 'examId'))
    return sendSuccess(res, null, 'Exam archived')
  } catch (e) {
    next(e)
  }
}

export async function startAttempt(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const attempt = await examService.startAttempt(
      orgId(req),
      param(req, 'examId'),
      req.user!.id
    )
    return sendSuccess(res, { attempt }, 'Attempt started', 201)
  } catch (e) {
    next(e)
  }
}

export async function getAttempt(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const isStaff = staffRoles.has(req.membershipRole || '')
    const attempt = await examService.getAttempt(
      orgId(req),
      param(req, 'attemptId'),
      req.user!.id,
      isStaff
    )
    return sendSuccess(res, { attempt })
  } catch (e) {
    next(e)
  }
}

export async function saveAnswers(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const attempt = await examService.saveAnswers(
      orgId(req),
      param(req, 'attemptId'),
      req.user!.id,
      req.body.answers
    )
    return sendSuccess(res, { attempt }, 'Answers saved')
  } catch (e) {
    next(e)
  }
}

export async function submitAttempt(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const attempt = await examService.submitAttempt(
      orgId(req),
      param(req, 'attemptId'),
      req.user!.id,
      req.body.answers
    )
    return sendSuccess(res, { attempt }, 'Attempt submitted')
  } catch (e) {
    next(e)
  }
}

export async function listMyAttempts(req: TenantRequest, res: Response, next: NextFunction) {
  try {
    const attempts = await examService.listMyAttempts(
      orgId(req),
      param(req, 'examId'),
      req.user!.id
    )
    return sendSuccess(res, { attempts })
  } catch (e) {
    next(e)
  }
}
