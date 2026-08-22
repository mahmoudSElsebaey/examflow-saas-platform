import type { ReactNode } from 'react'
import { AppHeader } from '@/components/layout/AppHeader'
import { OrgWorkspaceNav } from '@/components/layout/OrgWorkspaceNav'
import { OrgBrandScope } from '@/components/layout/OrgBrandScope'
import { Container } from '@/components/ui/Container'
import type { OrgMemberRole } from '@/features/organizations/types'

type Branding = {
  logoUrl?: string | null
  primaryColor?: string | null
}

type Props = {
  orgId: string
  orgName?: string | null
  role?: OrgMemberRole | null
  branding?: Branding | null
  children: ReactNode
  /** Hide the horizontal workspace nav (e.g. exam take flow) */
  hideNav?: boolean
  className?: string
}

/**
 * Consistent shell for all organization workspace pages.
 * Applies white-label branding, branded header, and role-aware nav.
 */
export function OrgWorkspaceLayout({
  orgId,
  orgName,
  role,
  branding,
  children,
  hideNav = false,
  className,
}: Props) {
  const homeTo = `/app/organizations/${orgId}`

  return (
    <OrgBrandScope branding={branding}>
      <div className={`min-h-screen bg-mesh ${className || ''}`}>
        <AppHeader
          homeTo={homeTo}
          brandTitle={orgName || undefined}
          logoUrl={branding?.logoUrl}
        />
        <Container className="py-6 sm:py-8">
          {!hideNav && <OrgWorkspaceNav role={role} />}
          {children}
        </Container>
      </div>
    </OrgBrandScope>
  )
}
