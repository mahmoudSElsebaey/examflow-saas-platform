import { appConfig } from '@/config/app'
import type { ApiResponse, AuthResponse, AuthUser } from '../types'

const BASE = `${appConfig.API_BASE_URL}/auth`

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
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

export async function registerApi(body: {
  email: string
  password: string
  firstName: string
  lastName: string
}) {
  return request<AuthResponse>('/register', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function loginApi(body: { email: string; password: string }) {
  return request<AuthResponse>('/login', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function logoutApi(accessToken: string) {
  return request<null>('/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

export async function meApi(accessToken: string) {
  return request<{ user: AuthUser }>('/me', {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}

export async function refreshApi() {
  return request<{ accessToken: string }>('/refresh', { method: 'POST' })
}

export async function forgotPasswordApi(email: string) {
  return request<null>('/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export async function resetPasswordApi(token: string, password: string) {
  return request<null>('/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  })
}

export async function verifyEmailApi(token: string) {
  return request<{ user: AuthUser }>('/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
  })
}

export async function resendVerificationApi(accessToken: string) {
  return request<null>('/resend-verification', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}
