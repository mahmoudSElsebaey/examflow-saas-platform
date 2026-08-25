import { useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  Building2,
  Shield,
  Home,
  LogOut,
  Menu,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'
import { appConfig } from '@/config/app'
import { cn } from '@/lib/utils'

type NavItem = { to: string; label: string; icon: LucideIcon; end?: boolean }

type Props = {
  children: ReactNode
  /** Extra sidebar links (e.g. org modules) */
  extraNav?: NavItem[]
  title?: string
}

export function AppShell({ children, extraNav = [], title }: Props) {
  const { t, i18n } = useTranslation()
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const ar = i18n.language?.startsWith('ar')

  const baseNav: NavItem[] = [
    {
      to: '/app',
      label: ar ? 'لوحة التحكم' : 'Dashboard',
      icon: LayoutDashboard,
      end: true,
    },
    {
      to: '/app/organizations',
      label: ar ? 'المؤسسات' : 'Organizations',
      icon: Building2,
    },
  ]
  if (user?.role === 'super_admin') {
    baseNav.push({
      to: '/app/admin',
      label: ar ? 'إدارة المنصة' : 'Platform admin',
      icon: Shield,
    })
  }

  const nav = [...baseNav, ...extraNav]

  const isActive = (item: NavItem) => {
    if (item.end) return pathname === item.to || pathname === `${item.to}/`
    return pathname === item.to || pathname.startsWith(`${item.to}/`)
  }

  const Sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <Link to="/app" className="flex items-center gap-2 font-bold text-foreground">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-800 text-xs text-primary-foreground">
            EF
          </span>
          <span className="truncate">{title || appConfig.APP_NAME}</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {nav.map((item) => {
          const Icon = item.icon
          const active = isActive(item)
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted hover:bg-surface-subtle hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="space-y-2 border-t border-border p-3">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface-subtle hover:text-foreground"
          onClick={() => setMobileOpen(false)}
        >
          <Home className="h-4 w-4" />
          {ar ? 'الصفحة التعريفية' : 'Marketing site'}
        </Link>
        <div className="flex items-center justify-between gap-2 px-1">
          <LanguageSwitcher variant="compact" />
          <button
            type="button"
            onClick={() => void logout()}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-muted hover:bg-surface-subtle hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            {t('common.logOut', { defaultValue: ar ? 'خروج' : 'Log out' })}
          </button>
        </div>
        {user && (
          <p className="truncate px-3 text-xs text-muted">
            {user.firstName} {user.lastName}
          </p>
        )}
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-mesh">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-e border-border bg-surface md:block">
        {Sidebar}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Close"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 start-0 w-72 border-e border-border bg-surface shadow-xl">
            <div className="absolute end-2 top-2">
              <button
                type="button"
                className="rounded-lg p-2 text-muted hover:bg-surface-subtle"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {Sidebar}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/60 bg-background/90 px-4 backdrop-blur md:px-6">
          <button
            type="button"
            className="rounded-lg p-2 text-muted hover:bg-surface-subtle md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground md:hidden">
              {title || appConfig.APP_NAME}
            </p>
          </div>
          <span className="hidden text-sm text-muted sm:inline">{user?.email}</span>
        </header>
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  )
}
