import { appConfig } from '@/config/app'
import type { ApiResponse } from '@/features/auth/types'

export interface ActivityItem {
  id: string
  action: string
  summary: string
  entityType?: string | null
  entityId?: string | null
  meta?: Record<string, unknown> | null
  actorId: string
  actorName?: string
  createdAt: string
}

export async function listActivityApi(
  token: string,
  orgId: string,
  limit = 50
) {
  const res = await fetch(
    `${appConfig.API_BASE_URL}/organizations/${orgId}/activity?limit=${limit}`,
    {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  )
  const json = (await res.json()) as ApiResponse<{ activity: ActivityItem[] }>
  if (!res.ok) {
    throw Object.assign(new Error(json.message || 'Failed to load activity'), {
      status: res.status,
    })
  }
  return json
}
