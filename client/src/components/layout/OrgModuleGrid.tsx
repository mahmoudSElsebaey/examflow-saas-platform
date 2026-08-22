import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Library,
  ClipboardList,
  BarChart3,
  Award,
  BookOpen,
  Users,
  UserCog,
  Settings,
  PenLine,
  CreditCard,
  type LucideIcon,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import type { OrgMemberRole } from '@/features/organizations/types'
import { visibleNavIds, type WorkspaceNavId } from '@/features/organizations/lib/roles'

type Module = {
  id: WorkspaceNavId
  to: string
  labelKey: string
  descKey: string
  icon: LucideIcon
}

type Props = {
  orgId: string
  role?: OrgMemberRole | null
  className?: string
}

export function OrgModuleGrid({ orgId, role, className }: Props) {
  const { t } = useTranslation()
  const base = `/app/organizations/${orgId}`
  const allowed = new Set(visibleNavIds(role))

  const allModules: Module[] = [
    {
      id: 'courses',
      to: `${base}/content?tab=courses`,
      labelKey: 'workspace.nav.courses',
      descKey: 'workspace.mod.courses',
      icon: BookOpen,
    },
    {
      id: 'banks',
      to: `${base}/content?tab=banks`,
      labelKey: 'workspace.nav.banks',
      descKey: 'workspace.mod.banks',
      icon: Library,
    },
    {
      id: 'exams',
      to: `${base}/exams`,
      labelKey: 'workspace.nav.exams',
      descKey: 'workspace.mod.exams',
      icon: ClipboardList,
    },
    {
      id: 'grading',
      to: `${base}/grading`,
      labelKey: 'workspace.nav.grading',
      descKey: 'workspace.mod.grading',
      icon: PenLine,
    },
    {
      id: 'students',
      to: `${base}/students`,
      labelKey: 'workspace.nav.students',
      descKey: 'workspace.mod.students',
      icon: Users,
    },
    {
      id: 'analytics',
      to: `${base}/analytics`,
      labelKey: 'workspace.nav.analytics',
      descKey: 'workspace.mod.analytics',
      icon: BarChart3,
    },
    {
      id: 'certificates',
      to: `${base}/certificates`,
      labelKey: 'workspace.nav.certificates',
      descKey: 'workspace.mod.certificates',
      icon: Award,
    },
    {
      id: 'members',
      to: `${base}/members`,
      labelKey: 'workspace.nav.members',
      descKey: 'workspace.mod.members',
      icon: UserCog,
    },
    {
      id: 'settings',
      to: `${base}/settings`,
      labelKey: 'workspace.nav.settings',
      descKey: 'workspace.mod.settings',
      icon: Settings,
    },
    {
      id: 'billing',
      to: `${base}/billing`,
      labelKey: 'workspace.nav.billing',
      descKey: 'workspace.mod.billing',
      icon: CreditCard,
    },
  ]

  const modules = allModules.filter((m) => allowed.has(m.id))

  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {modules.map(({ to, labelKey, descKey, icon: Icon, id }) => (
        <Link key={id} to={to} className="group">
          <Card className="h-full border-border/60 transition-all group-hover:border-primary/40 group-hover:shadow-md">
            <CardContent className="pt-6">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-muted text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground">{t(labelKey)}</h3>
              <p className="mt-1 text-sm text-muted">{t(descKey)}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
