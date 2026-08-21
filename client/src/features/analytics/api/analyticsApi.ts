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
