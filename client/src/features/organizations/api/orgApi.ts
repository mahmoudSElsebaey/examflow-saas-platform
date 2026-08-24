import { appConfig } from '@/config/app'
import type { ApiResponse } from '@/features/auth/types'
import type { Organization, OrgMember, OrgMemberRole } from '../types'

const BASE = `${appConfig.API_BASE_URL}/organizations`

async function request<T>(
  path: string,
  accessToken: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE}${path}`, {
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
      errors: json.errors,
    })
  }
  return json
}

export async function listOrganizationsApi(accessToken: string) {
  return request<{ organizations: Organization[] }>('/', accessToken)
}

export async function createOrganizationApi(
  accessToken: string,
  body: { name: string; slug?: string; description?: string }
) {
  return request<Organization>('/', accessToken, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function getOrganizationApi(accessToken: string, orgId: string) {
  return request<{ organization: Organization }>(`/${orgId}`, accessToken)
}

export async function updateOrganizationApi(
  accessToken: string,
  orgId: string,
  body: {
    name?: string
    description?: string | null
    primaryColor?: string | null
    logoUrl?: string | null
  }
) {
  return request<{ organization: Organization }>(`/${orgId}`, accessToken, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

export async function listMembersApi(accessToken: string, orgId: string) {
  return request<{ members: OrgMember[] }>(`/${orgId}/members`, accessToken)
}

export async function inviteMemberApi(
  accessToken: string,
  orgId: string,
  body: { email: string; role: Exclude<OrgMemberRole, 'owner'> }
) {
  return request<{ member: OrgMember }>(`/${orgId}/members`, accessToken, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function updateMemberRoleApi(
  accessToken: string,
  orgId: string,
  membershipId: string,
  role: Exclude<OrgMemberRole, 'owner'>
) {
  return request<{ member: OrgMember }>(
    `/${orgId}/members/${membershipId}`,
    accessToken,
    {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }
  )
}

export async function setMemberStatusApi(
  accessToken: string,
  orgId: string,
  membershipId: string,
  status: 'active' | 'suspended'
) {
  return request<{ member: OrgMember }>(
    `/${orgId}/members/${membershipId}/status`,
    accessToken,
    {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }
  )
}

export async function removeMemberApi(
  accessToken: string,
  orgId: string,
  membershipId: string
) {
  return request<{ removed: true }>(
    `/${orgId}/members/${membershipId}`,
    accessToken,
    { method: 'DELETE' }
  )
}
