import type { OrgMemberRole } from '../types'

const STAFF: OrgMemberRole[] = ['owner', 'admin', 'teacher', 'examiner']

export function isStaffRole(role?: OrgMemberRole | null): boolean {
  return !!role && STAFF.includes(role)
}

export function canManageContent(role?: OrgMemberRole | null): boolean {
  return isStaffRole(role)
}

export function canManageMembers(role?: OrgMemberRole | null): boolean {
  return !!role && ['owner', 'admin'].includes(role)
}

export function canViewAnalytics(role?: OrgMemberRole | null): boolean {
  return isStaffRole(role)
}

export function canGrade(role?: OrgMemberRole | null): boolean {
  return isStaffRole(role)
}

export function canManageBilling(role?: OrgMemberRole | null): boolean {
  return !!role && ['owner', 'admin'].includes(role)
}

export function canManageSettings(role?: OrgMemberRole | null): boolean {
  return canManageMembers(role)
}

export type WorkspaceNavId =
  | 'overview'
  | 'courses'
  | 'banks'
  | 'exams'
  | 'students'
  | 'certificates'
  | 'analytics'
  | 'members'
  | 'settings'
  | 'grading'
  | 'billing'
  | 'learn'

/**
 * Nav items visible for a given membership role.
 * Student sees a minimal student portal; staff sees management modules.
 */
export function visibleNavIds(role?: OrgMemberRole | null): WorkspaceNavId[] {
  if (!role) return ['overview']
  if (role === 'student') {
    return ['overview', 'learn', 'exams', 'certificates']
  }
  const ids: WorkspaceNavId[] = [
    'overview',
    'learn',
    'courses',
    'banks',
    'exams',
    'grading',
    'students',
    'certificates',
    'analytics',
  ]
  if (canManageMembers(role)) {
    ids.push('members', 'settings', 'billing')
  }
  return ids
}
