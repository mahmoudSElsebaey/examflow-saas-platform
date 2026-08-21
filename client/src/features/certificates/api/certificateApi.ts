import { appConfig } from '@/config/app'
import type { ApiResponse } from '@/features/auth/types'

export interface Certificate {
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

const base = (orgId: string) => `${appConfig.API_BASE_URL}/organizations/${orgId}`

async function request<T>(
  path: string,
  accessToken: string | null,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`
  const res = await fetch(path, {
    ...options,
    credentials: 'include',
    headers,
  })
  const json = (await res.json()) as ApiResponse<T>
  if (!res.ok) {
    throw Object.assign(new Error(json.message || 'Request failed'), {
      status: res.status,
    })
  }
  return json
}

export async function listCertificatesApi(token: string, orgId: string) {
  return request<{ certificates: Certificate[] }>(
    `${base(orgId)}/certificates`,
    token
  )
}

export async function issueCertificateApi(
  token: string,
  orgId: string,
  attemptId: string
) {
  return request<{ certificate: Certificate }>(
    `${base(orgId)}/attempts/${attemptId}/certificate`,
    token,
    { method: 'POST' }
  )
}

export async function verifyCertificateApi(code: string) {
  return request<{ certificate: Certificate; valid: boolean }>(
    `${appConfig.API_BASE_URL}/public/certificates/verify/${encodeURIComponent(code)}`,
    null
  )
}
