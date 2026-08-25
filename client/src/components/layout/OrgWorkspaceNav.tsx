import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard,
  BookOpen,
  Library,
  ClipboardList,
  Users,
  BarChart3,
  Award,
  UserCog,
  Settings,
  PenLine,
  CreditCard,
  GraduationCap,
  Search,
  History,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import * as orgApi from '@/features/organizations/api/orgApi'
import type { OrgMemberRole } from '@/features/organizations/types'
import {
  visibleNavIds,
  type WorkspaceNavId,
} from '@/features/organizations/lib/roles'
import { cn } from '@/lib/utils'

const NAV: {
  id: WorkspaceNavId
  path: string
  labelKey: string
  icon: LucideIcon
  group: 'main' | 'learn' | 'assess' | 'admin'
}[] = [
  { id: 'overview', path: '', labelKey: 'workspace.nav.overview', icon: LayoutDashboard, group: 'main' },
  { id: 'search', path: '/search', labelKey: 'workspace.nav.search', icon: Search, group: 'main' },
  { id: 'learn', path: '/learn', labelKey: 'workspace.nav.learn', icon: GraduationCap, group: 'learn' },
  { id: 'courses', path: '/content?tab=courses', labelKey: 'workspace.nav.courses', icon: BookOpen, group: 'learn' },
  { id: 'banks', path: '/content?tab=banks', labelKey: 'workspace.nav.banks', icon: Library, group: 'learn' },
  { id: 'exams', path: '/exams', labelKey: 'workspace.nav.exams', icon: ClipboardList, group: 'assess' },
  { id: 'grading', path: '/grading', labelKey: 'workspace.nav.grading', icon: PenLine, group: 'assess' },
  { id: 'students', path: '/students', labelKey: 'workspace.nav.students', icon: Users, group: 'assess' },
  { id: 'analytics', path: '/analytics', labelKey: 'workspace.nav.analytics', icon: BarChart3, group: 'assess' },
  { id: 'activity', path: '/activity', labelKey: 'workspace.nav.activity', icon: History, group: 'assess' },
  { id: 'certificates', path: '/certificates', labelKey: 'workspace.nav.certificates', icon: Award, group: 'assess' },
  { id: 'members', path: '/members', labelKey: 'workspace.nav.members', icon: UserCog, group: 'admin' },
  { id: 'settings', path: '/settings', labelKey: 'workspace.nav.settings', icon: Settings, group: 'admin' },
  { id: 'billing', path: '/billing', labelKey: 'workspace.nav.billing', icon: CreditCard, group: 'admin' },
]

const GROUP_ORDER = ['main', 'learn', 'assess', 'admin'] as const

function groupLabel(group: (typeof GROUP_ORDER)[number], ar: boolean): string {
  const map = {
    main: ar ? 'عام' : 'General',
    learn: ar ? 'التعلّم' : 'Learning',
    assess: ar ? 'التقييم' : 'Assessment',
    admin: ar ? 'الإدارة' : 'Admin',
  }
  return map[group]
}

function isActive(pathname: string, search: string, base: string, path: string): boolean {
  if (path === '') {
    return pathname === base || pathname === `${base}/`
  }
  if (path.startsWith('/content')) {
    if (!pathname.startsWith(`${base}/content`)) return false
    const tab = new URLSearchParams(path.split('?')[1] || '').get('tab')
    const currentTab = new URLSearchParams(search).get('tab') || 'courses'
    return !tab || tab === currentTab
  }
  const segment = path.split('?')[0]
  return pathname.startsWith(`${base}${segment}`)
}

type Props = {
  role?: OrgMemberRole | null
  className?: string
  orgName?: string | null
  /** Compact rail (icons only) — used on narrow screens via CSS */
  compact?: boolean
}

export function OrgWorkspaceNav({ role: roleProp, className, orgName }: Props) {
  const { orgId } = useParams<{ orgId: string }>()
  const { pathname, search } = useLocation()
  const { t, i18n } = useTranslation()
  const ar = i18n.language?.startsWith('ar')
  const { accessToken } = useAuth()
  const [role, setRole] = useState<OrgMemberRole | null | undefined>(roleProp)

  useEffect(() => {
    if (roleProp !== undefined) {
      setRole(roleProp)
      return
    }
    if (!accessToken || !orgId) return
    void orgApi
      .getOrganizationApi(accessToken, orgId)
      .then((res) => setRole(res.data?.organization?.myRole ?? null))
      .catch(() => setRole(null))
  }, [accessToken, orgId, roleProp])

  if (!orgId) return null
  const base = `/app/organizations/${orgId}`
  const allowed = new Set(visibleNavIds(role))
  const items = NAV.filter((n) => allowed.has(n.id))

  return (
    <nav
      className={cn('flex flex-col gap-1', className)}
      aria-label={t('workspace.navLabel', { defaultValue: 'Workspace' })}
    >
      <div className="mb-3 rounded-2xl bg-gradient-to-br from-primary via-primary to-primary-800 p-4 text-primary-foreground shadow-lg shadow-primary/20">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold leading-tight">
              {orgName || 'ExamFlow'}
            </p>
            <p className="text-[11px] opacity-80">
              {role ? String(role) : ar ? 'مساحة العمل' : 'Workspace'}
            </p>
          </div>
        </div>
      </div>

      {GROUP_ORDER.map((group) => {
        const groupItems = items.filter((i) => i.group === group)
        if (!groupItems.length) return null
        return (
          <div key={group} className="mb-3">
            <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-muted">
              {groupLabel(group, !!ar)}
            </p>
            <ul className="space-y-0.5">
              {groupItems.map(({ id, path, labelKey, icon: Icon }) => {
                const href = `${base}${path}`
                const active = isActive(pathname, search, base, path)
                return (
                  <li key={id}>
                    <Link
                      to={href}
                      className={cn(
                        'group relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all',
                        active
                          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                          : 'text-muted hover:bg-surface-subtle hover:text-foreground'
                      )}
                    >
                      {active && (
                        <span className="absolute inset-y-1 start-0 w-1 rounded-full bg-primary-foreground/80" />
                      )}
                      <Icon
                        className={cn(
                          'h-4 w-4 shrink-0',
                          active ? 'text-primary-foreground' : 'text-primary/80 group-hover:text-primary'
                        )}
                      />
                      <span className="truncate">{t(labelKey)}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </nav>
  )
}

export function OrgSubNav() {
  return null
}
