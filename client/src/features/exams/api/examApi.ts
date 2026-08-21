import { appConfig } from '@/config/app'
import type { ApiResponse } from '@/features/auth/types'
import type { Exam, ExamAttempt, AttemptAnswer } from '../types'

const base = (orgId: string) => `${appConfig.API_BASE_URL}/organizations/${orgId}`

async function request<T>(
  path: string,
  accessToken: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const res = await fetch(path, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...(options.headers || {}),
    },
  })
  const json = (await res.json()) as ApiResponse<T>
  if (!res.ok) {
    throw Object.assign(new Error(json.message || 'Request failed'), {
      status: res.status,
      errorCode: json.errorCode,
    })
  }
  return json
}

export async function listExamsApi(token: string, orgId: string) {
  return request<{ exams: Exam[] }>(`${base(orgId)}/exams`, token)
}

export async function getExamApi(token: string, orgId: string, examId: string) {
  return request<{ exam: Exam }>(`${base(orgId)}/exams/${examId}`, token)
}

export async function createExamApi(
  token: string,
  orgId: string,
  body: {
    title: string
    description?: string
    questionIds?: string[]
    timeLimitMinutes?: number | null
    passingScorePercent?: number
    maxAttempts?: number
  }
) {
  return request<{ exam: Exam }>(`${base(orgId)}/exams`, token, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function updateExamApi(
  token: string,
  orgId: string,
  examId: string,
  body: Partial<{
    title: string
    description: string | null
    questionIds: string[]
    timeLimitMinutes: number | null
    passingScorePercent: number
    maxAttempts: number
  }>
) {
  return request<{ exam: Exam }>(`${base(orgId)}/exams/${examId}`, token, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export async function publishExamApi(token: string, orgId: string, examId: string) {
  return request<{ exam: Exam }>(`${base(orgId)}/exams/${examId}/publish`, token, {
    method: 'POST',
  })
}

export async function startAttemptApi(token: string, orgId: string, examId: string) {
  return request<{ attempt: ExamAttempt }>(
    `${base(orgId)}/exams/${examId}/attempts`,
    token,
    { method: 'POST' }
  )
}

export async function getAttemptApi(token: string, orgId: string, attemptId: string) {
  return request<{ attempt: ExamAttempt }>(
    `${base(orgId)}/attempts/${attemptId}`,
    token
  )
}

export async function saveAnswersApi(
  token: string,
  orgId: string,
  attemptId: string,
  answers: AttemptAnswer[]
) {
  return request<{ attempt: ExamAttempt }>(
    `${base(orgId)}/attempts/${attemptId}/answers`,
    token,
    { method: 'PATCH', body: JSON.stringify({ answers }) }
  )
}

export async function submitAttemptApi(
  token: string,
  orgId: string,
  attemptId: string,
  answers?: AttemptAnswer[]
) {
  return request<{ attempt: ExamAttempt }>(
    `${base(orgId)}/attempts/${attemptId}/submit`,
    token,
    { method: 'POST', body: JSON.stringify({ answers }) }
  )
}
