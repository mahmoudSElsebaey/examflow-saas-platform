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

export type BillingData = {
  plan: string
  billingMode: string
  stripeConfigured?: boolean
  hasStripeCustomer?: boolean
  limits: Record<string, number | boolean>
  usage: Record<string, number>
  canUpgrade: boolean
}

export async function getOrgBillingApi(token: string, orgId: string) {
  return request<BillingData>(`${base(orgId)}/billing`, token)
}

export async function changePlanApi(token: string, orgId: string, plan: string) {
  return request<{ plan?: string; checkoutUrl?: string; billingMode: string }>(
    `${base(orgId)}/billing/plan`,
    token,
    {
      method: 'POST',
      body: JSON.stringify({ plan }),
    }
  )
}

export async function billingPortalApi(token: string, orgId: string) {
  return request<{ url: string }>(`${base(orgId)}/billing/portal`, token, {
    method: 'POST',
  })
}

export async function listPlansApi(token: string) {
  return request<{
    plans: {
      id: string
      priceMonthlyUsd: number
      billingMode: string
      limits: Record<string, unknown>
    }[]
  }>(`${appConfig.API_BASE_URL}/billing/plans`, token)
}
