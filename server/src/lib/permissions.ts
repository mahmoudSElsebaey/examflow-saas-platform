import type { OrgMemberRole } from '../types/organization.js'
import type { UserRole } from '../types/auth.js'

/** Roles that can manage org learning content and exams */
export const ORG_STAFF_ROLES: OrgMemberRole[] = [
  'owner',
  'admin',
  'teacher',
  'examiner',
]

export const ORG_ADMIN_ROLES: OrgMemberRole[] = ['owner', 'admin']

export function isOrgStaff(role?: OrgMemberRole | null): boolean {
  return !!role && ORG_STAFF_ROLES.includes(role)
}

export function isOrgAdmin(role?: OrgMemberRole | null): boolean {
  return !!role && ORG_ADMIN_ROLES.includes(role)
}

export function canManageContent(role?: OrgMemberRole | null): boolean {
  return isOrgStaff(role)
}

export function canManageMembers(role?: OrgMemberRole | null): boolean {
  return isOrgAdmin(role)
}

export function canViewAnalytics(role?: OrgMemberRole | null): boolean {
  return isOrgStaff(role)
}

/** Platform-level role (global User.role). Prefer Membership role inside org scopes. */
export function isPlatformSuperAdmin(role?: UserRole | null): boolean {
  return role === 'super_admin'
}

/**
 * Resolve effective capability inside an organization.
 * Membership role is the source of truth for tenant actions.
 */
export function effectiveOrgRole(
  membershipRole?: OrgMemberRole | null
): OrgMemberRole | null {
  return membershipRole ?? null
}
