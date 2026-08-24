import { appConfig } from '@/config/app'
import type { ApiResponse } from '@/features/auth/types'

export type SearchResultType = 'exam' | 'question' | 'course' | 'bank' | 'member'

export interface SearchHit {
  type: SearchResultType
  id: string
  title: string
  subtitle?: string | null
  meta?: Record<string, string | number | boolean | null>
  hrefHint?: string
}

export interface SearchResponse {
  query: string
  total: number
  hits: SearchHit[]
}

export async function searchOrgApi(
  token: string,
  orgId: string,
  q: string,
  types?: SearchResultType[]
) {
  const params = new URLSearchParams()
  params.set('q', q)
  if (types?.length) params.set('types', types.join(','))
  const res = await fetch(
    `${appConfig.API_BASE_URL}/organizations/${orgId}/search?${params.toString()}`,
    {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  )
  const json = (await res.json()) as ApiResponse<{ search: SearchResponse }>
  if (!res.ok) {
    throw Object.assign(new Error(json.message || 'Search failed'), {
      status: res.status,
    })
  }
  return json
}
