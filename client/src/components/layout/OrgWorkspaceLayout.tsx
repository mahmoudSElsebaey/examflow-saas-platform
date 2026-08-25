import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu, X, LayoutDashboard, Home } from 'lucide-react'
import { OrgWorkspaceNav } from '@/components/layout/OrgWorkspaceNav'
import { OrgBrandScope } from '@/components/layout/OrgBrandScope'
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'
import { useAuth } from '@/features/auth/AuthContext'
import type { OrgMemberRole } from '@/features/organizations/types'
import { cn } from '@/lib/utils'

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
  hideNav?: boolean
  className?: string
}

/**
 * Unique vertical workspace shell — sidebar + content (not horizontal tabs).
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
  const { t, i18n } = useTranslation()
  const ar = i18n.language?.startsWith('ar')
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const homeTo = `/app/organizations/${orgId}`

  const SidebarBody = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-3 md:border-border">
        <Link to={homeTo} className="flex min-w-0 items-center gap-2">
          {branding?.logoUrl ? (
            <img
              src={branding.logoUrl}
              alt=""
              className="h-8 w-8 rounded-lg object-contain bg-white/10"
            />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-800 text-[10px] font-bold text-primary-foreground">
              EF
            </span>
          )}
          <span className="truncate text-sm font-bold text-foreground">
            {orgName || 'ExamFlow'}
          </span>
        </Link>
        <button
          type="button"
          className="rounded-lg p-1.5 text-muted hover:bg-surface-subtle md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {!hideNav && (
          <OrgWorkspaceNav role={role} orgName={orgName} />
        )}
      </div>

      <div className="space-y-1 border-t border-border p-3">
        <Link
          to="/app"
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted hover:bg-surface-subtle hover:text-foreground"
          onClick={() => setMobileOpen(false)}
        >
          <LayoutDashboard className="h-4 w-4" />
          {ar ? 'لوحة التحكم' : 'Dashboard'}
        </Link>
        <Link
          to="/"
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted hover:bg-surface-subtle hover:text-foreground"
          onClick={() => setMobileOpen(false)}
        >
          <Home className="h-4 w-4" />
          {ar ? 'الموقع التعريفي' : 'Marketing site'}
        </Link>
        <div className="flex items-center justify-between px-1 pt-1">
          <LanguageSwitcher variant="compact" />
          <button
            type="button"
            onClick={() => void logout()}
            className="text-xs text-muted hover:text-foreground"
          >
            {t('auth.logout', { defaultValue: ar ? 'خروج' : 'Log out' })}
          </button>
        </div>
        {user && (
          <p className="truncate px-3 text-[11px] text-muted">
            {user.firstName} {user.lastName}
          </p>
        )}
      </div>
    </div>
  )

  return (
    <OrgBrandScope branding={branding}>
      <div className={cn('flex min-h-screen bg-mesh', className)}>
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-[17.5rem] shrink-0 border-e border-border bg-surface/95 shadow-sm backdrop-blur-md lg:block">
          {SidebarBody}
        </aside>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/45"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="absolute inset-y-0 start-0 w-[18rem] max-w-[88vw] bg-surface shadow-2xl">
              {SidebarBody}
            </aside>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/60 bg-background/85 px-4 backdrop-blur lg:px-8">
            <button
              type="button"
              className="rounded-xl border border-border p-2 text-muted hover:bg-surface-subtle lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {orgName || 'ExamFlow'}
              </p>
              <p className="text-[11px] text-muted">
                {ar ? 'مساحة عمل المؤسسة' : 'Organization workspace'}
              </p>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">{children}</main>
        </div>
      </div>
    </OrgBrandScope>
  )
}
