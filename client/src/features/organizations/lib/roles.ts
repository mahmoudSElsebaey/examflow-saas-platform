import type { OrgMemberRole } from '../types'

export type WorkspaceNavId =
  | 'overview'
  | 'courses'
  | 'banks'
  | 'exams'
  | 'students'
  | 'analytics'
  | 'certificates'
  | 'members'
  | 'settings'

const STAFF: OrgMemberRole[] = ['owner', 'admin', 'teacher', 'examiner']

export function isStaffRole(role?: OrgMemberRole | null): boolean {
  return !!role && STAFF.includes(role)
}

export function canManageContent(role?: OrgMemberRole | null): boolean {
  return !!role && ['owner', 'admin', 'teacher', 'examiner'].includes(role)
}

export function canManageMembers(role?: OrgMemberRole | null): boolean {
  return !!role && ['owner', 'admin'].includes(role)
}

export function visibleNavIds(role?: OrgMemberRole | null): WorkspaceNavId[] {
  if (!role) return ['overview']
  if (role === 'student') {
    return ['overview', 'exams', 'certificates']
  }
  const ids: WorkspaceNavId[] = [
    'overview',
    'courses',
    'banks',
    'exams',
    'students',
    'certificates',
    'analytics',
  ]
  if (canManageMembers(role)) {
    ids.push('members', 'settings')
  }
  return ids
}
