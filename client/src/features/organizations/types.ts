export type OrgMemberRole = 'owner' | 'admin' | 'teacher' | 'examiner' | 'student'
export type MembershipStatus = 'active' | 'invited' | 'suspended'
export type OrgPlan = 'free' | 'professional' | 'enterprise'

export interface Organization {
  id: string
  name: string
  slug: string
  description?: string | null
  ownerId: string
  plan: OrgPlan
  isActive: boolean
  branding?: {
    logoUrl?: string | null
    primaryColor?: string | null
  }
  createdAt: string
  updatedAt: string
  myRole?: OrgMemberRole
}

export interface OrgMember {
  id: string
  userId: string
  email: string
  firstName: string
  lastName: string
  role: OrgMemberRole
  status: MembershipStatus
  joinedAt: string
}
