import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Building2,
  ArrowRight,
  BookOpen,
  ClipboardList,
  Library,
  Award,
  BarChart3,
  Plus,
  GraduationCap,
  User,
} from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import * as orgApi from '@/features/organizations/api/orgApi'
import type { Organization } from '@/features/organizations/types'
import { isStaffRole } from '@/features/organizations/lib/roles'
import { Button } from '@/components/ui/Button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { AppShell } from '@/components/layout/AppShell'

function staffLike(orgs: Organization[]): boolean {
  return orgs.some((o) => isStaffRole(o.myRole))
}

function primaryOrg(orgs: Organization[]): Organization | null {
  if (!orgs.length) return null
  return orgs.find((o) => isStaffRole(o.myRole)) || orgs[0]
}

export function DashboardPage() {
  const { t, i18n } = useTranslation()
  const ar = i18n.language?.startsWith('ar')
  const { user, accessToken } = useAuth()
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!accessToken) return
    ;(async () => {
      try {
        const res = await orgApi.listOrganizationsApi(accessToken)
        setOrgs(res.data?.organizations ?? [])
      } catch {
        setOrgs([])
      } finally {
        setLoading(false)
      }
    })()
  }, [accessToken])

  const isStaff = useMemo(() => staffLike(orgs), [orgs])
  const focus = primaryOrg(orgs)

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t('dashboard.welcome', { name: user?.firstName || '' })}
        </h1>
        <p className="mt-1 text-muted">
          {isStaff
            ? t('dashboard.staffSubtitle', {
                defaultValue: ar
                  ? 'إدارة المحتوى والامتحانات من مساحة العمل'
                  : 'Manage content and exams from your workspace',
              })
            : t('dashboard.studentSubtitle', {
                defaultValue: ar
                  ? 'تابع التعلّم والامتحانات والشهادات'
                  : 'Follow learning, exams, and certificates',
              })}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : orgs.length === 0 ? (
        <Card className="border-dashed border-border">
          <CardContent className="py-12 text-center">
            <Building2 className="mx-auto mb-3 h-10 w-10 text-muted" />
            <h2 className="text-lg font-semibold">{t('org.emptyTitle')}</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted">
              {t('dashboard.emptyHint', {
                defaultValue: ar
                  ? 'أنشئ مؤسسة للبدء، أو اقبل دعوة وصلت لبريدك.'
                  : 'Create an organization to start, or accept an invite.',
              })}
            </p>
            <Link to="/app/organizations" className="mt-6 inline-block">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t('org.create')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {focus && (
              <Card className="overflow-hidden border-primary/25">
                <div className="bg-gradient-to-br from-primary to-primary-800 px-6 py-5 text-primary-foreground">
                  <p className="text-xs font-semibold uppercase tracking-wide opacity-90">
                    {t('dashboard.yourWorkspace', {
                      defaultValue: ar ? 'مساحة العمل' : 'Your workspace',
                    })}
                  </p>
                  <h2 className="mt-1 text-xl font-bold">{focus.name}</h2>
                  <div className="mt-2">
                    <Badge variant="info" className="bg-white/20 text-white border-0">
                      {focus.myRole}
                    </Badge>
                  </div>
                </div>
                <CardContent className="flex flex-wrap gap-3 py-4">
                  <Link to={`/app/organizations/${focus.id}`}>
                    <Button className="gap-2">
                      {ar ? 'فتح المؤسسة' : 'Open organization'}
                      <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                    </Button>
                  </Link>
                  {user && (
                    <Link to={`/app/organizations/${focus.id}/members/${user.id}`}>
                      <Button variant="outline" className="gap-2">
                        <User className="h-4 w-4" />
                        {ar ? 'ملفي في المؤسسة' : 'My org profile'}
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            )}

            {focus && (
              <section>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
                  {t('dashboard.quickActions', {
                    defaultValue: ar ? 'اختصارات' : 'Quick actions',
                  })}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(isStaff
                    ? [
                        {
                          to: `/app/organizations/${focus.id}/content?tab=courses`,
                          label: t('workspace.nav.courses', { defaultValue: 'Courses' }),
                          icon: BookOpen,
                        },
                        {
                          to: `/app/organizations/${focus.id}/content?tab=banks`,
                          label: t('workspace.nav.banks', { defaultValue: 'Banks' }),
                          icon: Library,
                        },
                        {
                          to: `/app/organizations/${focus.id}/exams`,
                          label: t('workspace.nav.exams', { defaultValue: 'Exams' }),
                          icon: ClipboardList,
                        },
                        {
                          to: `/app/organizations/${focus.id}/analytics`,
                          label: t('workspace.nav.analytics', { defaultValue: 'Analytics' }),
                          icon: BarChart3,
                        },
                      ]
                    : [
                        {
                          to: `/app/organizations/${focus.id}/learn`,
                          label: ar ? 'التعلّم' : 'Learn',
                          icon: GraduationCap,
                        },
                        {
                          to: `/app/organizations/${focus.id}/exams`,
                          label: ar ? 'الامتحانات' : 'Exams',
                          icon: ClipboardList,
                        },
                        {
                          to: `/app/organizations/${focus.id}/certificates`,
                          label: ar ? 'شهاداتي' : 'Certificates',
                          icon: Award,
                        },
                        {
                          to: `/app/organizations/${focus.id}/progress`,
                          label: ar ? 'تقدّمي' : 'My progress',
                          icon: BarChart3,
                        },
                      ]
                  ).map(({ to, label, icon: Icon }) => (
                    <Link key={to} to={to} className="group">
                      <Card className="h-full border-border/60 transition-all group-hover:border-primary/40 group-hover:shadow-sm">
                        <CardContent className="flex items-center gap-3 pt-5">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-muted text-primary">
                            <Icon className="h-5 w-5" />
                          </span>
                          <span className="font-medium text-foreground">{label}</span>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="space-y-6">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">
                  {ar ? 'مؤسساتك' : 'Your organizations'}
                </CardTitle>
                <CardDescription>
                  {ar ? 'اختر مساحة عمل' : 'Pick a workspace'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 p-0">
                <ul className="divide-y divide-border">
                  {orgs.map((o) => (
                    <li key={o.id}>
                      <Link
                        to={`/app/organizations/${o.id}`}
                        className="flex items-center justify-between gap-2 px-5 py-3 hover:bg-surface-subtle"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{o.name}</p>
                          <p className="text-xs text-muted">{o.myRole}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 shrink-0 text-muted rtl:rotate-180" />
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="p-3">
                  <Link to="/app/organizations">
                    <Button variant="outline" size="sm" className="w-full gap-1">
                      <Plus className="h-3.5 w-3.5" />
                      {ar ? 'إدارة / إنشاء' : 'Manage / create'}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">{ar ? 'الحساب' : 'Account'}</CardTitle>
                <CardDescription className="truncate">{user?.email}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2 text-sm">
                <Badge variant="info">{user?.role}</Badge>
                <span className="text-muted">
                  {user?.isEmailVerified
                    ? ar
                      ? 'البريد مفعّل'
                      : 'Email verified'
                    : ar
                      ? 'البريد غير مفعّل'
                      : 'Email pending'}
                </span>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </AppShell>
  )
}
