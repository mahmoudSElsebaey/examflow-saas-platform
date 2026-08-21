export type UserRole = 'super_admin' | 'org_owner' | 'teacher' | 'examiner' | 'student'

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  isEmailVerified: boolean
}

export interface AuthResponse {
  user: AuthUser
  accessToken: string
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  errorCode?: string
  errors?: { path: string; message: string }[]
}
