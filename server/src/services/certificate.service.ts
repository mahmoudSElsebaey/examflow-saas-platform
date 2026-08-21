import { randomBytes } from 'crypto'
import { Certificate } from '../models/Certificate.js'
import { ExamAttempt } from '../models/ExamAttempt.js'
import { Exam } from '../models/Exam.js'
import { User } from '../models/User.js'
import { Organization } from '../models/Organization.js'
import { AppError } from '../middlewares/errorHandler.js'
import type { CertificateDTO } from '../types/certificate.js'

function toDTO(
  c: InstanceType<typeof Certificate>,
  organizationName?: string
): CertificateDTO {
  return {
    id: c.id,
    organizationId: c.organizationId.toString(),
    examId: c.examId.toString(),
    attemptId: c.attemptId.toString(),
    userId: c.userId.toString(),
    code: c.code,
    recipientName: c.recipientName,
    examTitle: c.examTitle,
    score: c.score,
    maxScore: c.maxScore,
    percent: c.percent,
    issuedAt: c.issuedAt.toISOString(),
    organizationName,
  }
}

function generateCode(): string {
  return `EF-${randomBytes(4).toString('hex').toUpperCase()}-${randomBytes(2)
    .toString('hex')
    .toUpperCase()}`
}

export async function issueCertificateForAttempt(
  orgId: string,
  attemptId: string,
  requesterId: string,
  isStaff: boolean
): Promise<CertificateDTO> {
  const attempt = await ExamAttempt.findOne({
    _id: attemptId,
    organizationId: orgId,
  })
  if (!attempt) throw new AppError('Attempt not found', 404, 'ATTEMPT_NOT_FOUND')

  if (!isStaff && attempt.userId.toString() !== requesterId) {
    throw new AppError('Forbidden', 403, 'FORBIDDEN')
  }

  if (attempt.status !== 'submitted' && attempt.status !== 'timed_out') {
    throw new AppError('Attempt is not completed', 400, 'ATTEMPT_NOT_COMPLETED')
  }
  if (!attempt.passed) {
    throw new AppError('Certificate only for passed attempts', 400, 'NOT_PASSED')
  }

  const existing = await Certificate.findOne({ attemptId })
  if (existing) {
    const org = await Organization.findById(orgId)
    return toDTO(existing, org?.name)
  }

  const [user, exam, org] = await Promise.all([
    User.findById(attempt.userId),
    Exam.findById(attempt.examId),
    Organization.findById(orgId),
  ])

  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND')

  const cert = await Certificate.create({
    organizationId: orgId,
    examId: attempt.examId,
    attemptId: attempt.id,
    userId: attempt.userId,
    code: generateCode(),
    recipientName: `${user.firstName} ${user.lastName}`.trim(),
    examTitle: exam?.title || 'Exam',
    score: attempt.score ?? 0,
    maxScore: attempt.maxScore ?? 0,
    percent: attempt.percent ?? 0,
    issuedAt: new Date(),
  })

  return toDTO(cert, org?.name)
}

export async function listCertificates(
  orgId: string,
  userId: string,
  isStaff: boolean
): Promise<CertificateDTO[]> {
  const filter: Record<string, unknown> = { organizationId: orgId }
  if (!isStaff) filter.userId = userId

  const certs = await Certificate.find(filter).sort({ issuedAt: -1 }).limit(100)
  const org = await Organization.findById(orgId)
  return certs.map((c) => toDTO(c, org?.name))
}

export async function getCertificateByCode(code: string): Promise<CertificateDTO> {
  const cert = await Certificate.findOne({ code: code.toUpperCase() })
  if (!cert) throw new AppError('Certificate not found', 404, 'CERT_NOT_FOUND')
  const org = await Organization.findById(cert.organizationId)
  return toDTO(cert, org?.name)
}

export async function getCertificate(
  orgId: string,
  certId: string,
  userId: string,
  isStaff: boolean
): Promise<CertificateDTO> {
  const cert = await Certificate.findOne({ _id: certId, organizationId: orgId })
  if (!cert) throw new AppError('Certificate not found', 404, 'CERT_NOT_FOUND')
  if (!isStaff && cert.userId.toString() !== userId) {
    throw new AppError('Forbidden', 403, 'FORBIDDEN')
  }
  const org = await Organization.findById(orgId)
  return toDTO(cert, org?.name)
}
