import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Library,
  ClipboardList,
  BarChart3,
  Award,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

type Module = {
  to: string
  labelKey: string
  descKey: string
  icon: LucideIcon
}

type Props = {
  orgId: string
  className?: string
}

export function OrgModuleGrid({ orgId, className }: Props) {
  const { t } = useTranslation()
  const base = `/app/organizations/${orgId}`

  const modules: Module[] = [
    {
      to: `${base}/content`,
      labelKey: 'content.manageContent',
      descKey: 'phase9.modContentDesc',
      icon: Library,
    },
    {
      to: `${base}/exams`,
      labelKey: 'exam.manageExams',
      descKey: 'phase9.modExamsDesc',
      icon: ClipboardList,
    },
    {
      to: `${base}/analytics`,
      labelKey: 'analytics.manage',
      descKey: 'phase9.modAnalyticsDesc',
      icon: BarChart3,
    },
    {
      to: `${base}/certificates`,
      labelKey: 'cert.manage',
      descKey: 'phase9.modCertDesc',
      icon: Award,
    },
    {
      to: base,
      labelKey: 'org.members',
      descKey: 'phase9.modMembersDesc',
      icon: Users,
    },
  ]

  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {modules.map(({ to, labelKey, descKey, icon: Icon }) => (
        <Link key={to + labelKey} to={to} className="group">
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
