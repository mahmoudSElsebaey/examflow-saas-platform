import { appConfig } from '@/config/app'
import type { ApiResponse } from '@/features/auth/types'

const base = (orgId: string) => `${appConfig.API_BASE_URL}/organizations/${orgId}`

async function request<T>(path: string, token: string, options: RequestInit = {}) {
  const res = await fetch(path, {
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

export async function getOrgBillingApi(token: string, orgId: string) {
  return request<{
    plan: string
    billingMode: string
    limits: Record<string, number | boolean>
    usage: Record<string, number>
    canUpgrade: boolean
  }>(`${base(orgId)}/billing`, token)
}

export async function changePlanApi(token: string, orgId: string, plan: string) {
  return request<{ plan: string }>(`${base(orgId)}/billing/plan`, token, {
    method: 'POST',
    body: JSON.stringify({ plan }),
  })
}

export async function listPlansApi(token: string) {
  return request<{ plans: { id: string; priceMonthlyUsd: number; limits: Record<string, unknown> }[] }>(
    `${appConfig.API_BASE_URL}/billing/plans`,
    token
  )
}
