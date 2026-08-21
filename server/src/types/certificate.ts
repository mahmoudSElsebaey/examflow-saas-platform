export interface CertificateDTO {
  id: string
  organizationId: string
  examId: string
  attemptId: string
  userId: string
  code: string
  recipientName: string
  examTitle: string
  score: number
  maxScore: number
  percent: number
  issuedAt: string
  organizationName?: string
}
