import { Link, useLocation, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

const items = [
  { path: '', labelKey: 'phase9.navOverview' },
  { path: '/content', labelKey: 'content.manageContent' },
  { path: '/exams', labelKey: 'exam.manageExams' },
  { path: '/analytics', labelKey: 'analytics.manage' },
  { path: '/certificates', labelKey: 'cert.manage' },
] as const

export function OrgSubNav() {
  const { orgId } = useParams<{ orgId: string }>()
  const { pathname } = useLocation()
  const { t } = useTranslation()
  if (!orgId) return null

  const base = `/app/organizations/${orgId}`

  return (
    <nav className="mb-8 flex flex-wrap gap-1 border-b border-border pb-2">
      {items.map(({ path, labelKey }) => {
        const href = `${base}${path}`
        const active =
          path === ''
            ? pathname === base || pathname === `${base}/`
            : pathname.startsWith(href)
        return (
          <Link
            key={href}
            to={href}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-muted hover:bg-surface-subtle hover:text-foreground'
            )}
          >
            {t(labelKey)}
          </Link>
        )
      })}
    </nav>
  )
}
