import type { Request } from 'express'

export type UserRole = 'super_admin' | 'org_owner' | 'teacher' | 'examiner' | 'student'

export interface JwtPayload {
  userId: string
  email: string
  role: UserRole
}

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  isEmailVerified: boolean
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser
}
