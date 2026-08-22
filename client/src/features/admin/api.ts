import { appConfig } from '@/config/app'
import type { ApiResponse } from '@/features/auth/types'

const BASE = `${appConfig.API_BASE_URL}/admin`

async function request<T>(path: string, token: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  })
  const json = (await res.json()) as ApiResponse<T>
  if (!res.ok) throw new Error(json.message || 'Request failed')
  return json
}

export async function adminMetricsApi(token: string) {
  return request<Record<string, number>>('/metrics', token)
}

export async function adminOrgsApi(token: string) {
  return request<{
    organizations: {
      id: string
      name: string
      slug: string
      plan: string
      isActive: boolean
      ownerEmail: string | null
      createdAt: string
    }[]
  }>('/organizations', token)
}

export async function adminSuspendOrgApi(token: string, orgId: string) {
  return request<{ organization: { id: string; isActive: boolean } }>(
    `/organizations/${orgId}/suspend`,
    token,
    { method: 'POST' }
  )
}

export async function adminActivateOrgApi(token: string, orgId: string) {
  return request<{ organization: { id: string; isActive: boolean } }>(
    `/organizations/${orgId}/activate`,
    token,
    { method: 'POST' }
  )
}
