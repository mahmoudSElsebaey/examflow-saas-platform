import { appConfig } from '@/config/app'
import type { ApiResponse } from '@/features/auth/types'

export interface OrgAnalytics {
  examsCount: number
  publishedExamsCount: number
  questionsCount: number
  attemptsCount: number
  completedAttemptsCount: number
  averagePercent: number | null
  passRate: number | null
  recentAttempts: {
    id: string
    examId: string
    examTitle: string
    userId: string
    studentName?: string
    status: string
    percent: number | null
    passed: boolean | null
    submittedAt: string | null
  }[]
}

const base = (orgId: string) => `${appConfig.API_BASE_URL}/organizations/${orgId}`

async function request<T>(
  path: string,
  accessToken: string
): Promise<ApiResponse<T>> {
  const res = await fetch(path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })
  const json = (await res.json()) as ApiResponse<T>
  if (!res.ok) {
    throw Object.assign(new Error(json.message || 'Request failed'), {
      status: res.status,
    })
  }
  return json
}

export async function getOrgAnalyticsApi(token: string, orgId: string) {
  return request<{ analytics: OrgAnalytics }>(`${base(orgId)}/analytics`, token)
}

export interface StudentHistory {
  attemptsCount: number
  completedCount: number
  averagePercent: number | null
  passRate: number | null
  lessonsViewed: number
  lessonsCompleted: number
  attempts: {
    id: string
    examId: string
    examTitle: string
    status: string
    percent: number | null
    passed: boolean | null
    startedAt: string
    submittedAt: string | null
  }[]
  recentLessons: {
    lessonId: string
    lessonTitle: string
    status: string
    viewedAt: string
    completedAt: string | null
  }[]
}

export async function getStudentHistoryApi(token: string, orgId: string) {
  return request<{ analytics: StudentHistory }>(`${base(orgId)}/analytics/me`, token)
}

/** Download org attempts as CSV (staff). */
export async function downloadOrgAttemptsCsv(token: string, orgId: string) {
  const res = await fetch(`${base(orgId)}/analytics/export/attempts.csv`, {
    credentials: 'include',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    throw new Error((json as { message?: string }).message || 'Export failed')
  }
  const blob = await res.blob()
  const cd = res.headers.get('Content-Disposition')
  const match = cd?.match(/filename="?([^";]+)"?/)
  const filename = match?.[1] || `examflow-attempts-${Date.now()}.csv`
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/** Download single-exam attempts as CSV (staff). */
export async function downloadExamAttemptsCsv(
  token: string,
  orgId: string,
  examId: string
) {
  const res = await fetch(`${base(orgId)}/exams/${examId}/analytics/export.csv`, {
    credentials: 'include',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const json = await res.json().catch(() => ({}))
    throw new Error((json as { message?: string }).message || 'Export failed')
  }
  const blob = await res.blob()
  const cd = res.headers.get('Content-Disposition')
  const match = cd?.match(/filename="?([^";]+)"?/)
  const filename = match?.[1] || `examflow-exam-attempts-${Date.now()}.csv`
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
