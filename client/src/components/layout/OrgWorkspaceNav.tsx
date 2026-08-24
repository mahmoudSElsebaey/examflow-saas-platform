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
}[] = [
  { id: 'overview', path: '', labelKey: 'workspace.nav.overview', icon: LayoutDashboard },
  { id: 'search', path: '/search', labelKey: 'workspace.nav.search', icon: Search },
  { id: 'learn', path: '/learn', labelKey: 'workspace.nav.learn', icon: GraduationCap },
  { id: 'courses', path: '/content?tab=courses', labelKey: 'workspace.nav.courses', icon: BookOpen },
  { id: 'banks', path: '/content?tab=banks', labelKey: 'workspace.nav.banks', icon: Library },
  { id: 'exams', path: '/exams', labelKey: 'workspace.nav.exams', icon: ClipboardList },
  { id: 'grading', path: '/grading', labelKey: 'workspace.nav.grading', icon: PenLine },
  { id: 'students', path: '/students', labelKey: 'workspace.nav.students', icon: Users },
  { id: 'analytics', path: '/analytics', labelKey: 'workspace.nav.analytics', icon: BarChart3 },
  { id: 'activity', path: '/activity', labelKey: 'workspace.nav.activity', icon: History },
  { id: 'certificates', path: '/certificates', labelKey: 'workspace.nav.certificates', icon: Award },
  { id: 'members', path: '/members', labelKey: 'workspace.nav.members', icon: UserCog },
  { id: 'settings', path: '/settings', labelKey: 'workspace.nav.settings', icon: Settings },
  { id: 'billing', path: '/billing', labelKey: 'workspace.nav.billing', icon: CreditCard },
]

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
}

export function OrgWorkspaceNav({ role: roleProp, className }: Props) {
  const { orgId } = useParams<{ orgId: string }>()
  const { pathname, search } = useLocation()
  const { t } = useTranslation()
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
      className={cn(
        'mb-6 flex gap-1 overflow-x-auto border-b border-border pb-2',
        className
      )}
      aria-label={t('workspace.navLabel')}
    >
      {items.map(({ id, path, labelKey, icon: Icon }) => {
        const href = `${base}${path}`
        const active = isActive(pathname, search, base, path)
        return (
          <Link
            key={id}
            to={href}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              active
                ? 'bg-primary-muted text-primary'
                : 'text-muted hover:bg-surface-subtle hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {t(labelKey, {
              defaultValue:
                id === 'search'
                  ? 'Search'
                  : id === 'activity'
                    ? 'Activity'
                    : id,
            })}
          </Link>
        )
      })}
    </nav>
  )
}

export function OrgSubNav() {
  return <OrgWorkspaceNav />
}
