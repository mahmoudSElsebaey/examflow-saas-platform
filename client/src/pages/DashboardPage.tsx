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
import { Container } from '@/components/ui/Container'
import { Spinner } from '@/components/ui/Spinner'
import { AppHeader } from '@/components/layout/AppHeader'

function staffLike(orgs: Organization[]): boolean {
  return orgs.some((o) => isStaffRole(o.myRole))
}

function primaryOrg(orgs: Organization[]): Organization | null {
  if (!orgs.length) return null
  return orgs.find((o) => isStaffRole(o.myRole)) || orgs[0]
}

export function DashboardPage() {
  const { t } = useTranslation()
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
    <div className="min-h-screen bg-mesh">
      <AppHeader />
      <Container className="py-8 sm:py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t('dashboard.welcome', { name: user?.firstName || '' })}
          </h1>
          <p className="mt-1 text-muted">
            {isStaff ? t('dashboard.staffSubtitle') : t('dashboard.studentSubtitle')}
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
              <h2 className="text-lg font-semibold text-foreground">{t('org.emptyTitle')}</h2>
              <p className="mx-auto mt-1 max-w-md text-sm text-muted">{t('dashboard.emptyHint')}</p>
              <Link to="/app/organizations" className="mt-6 inline-block">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t('org.create')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {focus && (
              <Card className="border-primary/30 bg-primary-muted/30">
                <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                      {t('dashboard.yourWorkspace')}
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-foreground">{focus.name}</h2>
                    <p className="mt-0.5 text-sm text-muted">
                      {t('dashboard.roleInOrg')}: <Badge variant="info">{focus.myRole}</Badge>
                    </p>
                  </div>
                  <Link to={`/app/organizations/${focus.id}`}>
                    <Button size="lg" className="w-full gap-2 sm:w-auto">
                      {t('dashboard.openWorkspace')}
                      <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {isStaff && focus && (
              <section>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
                  {t('dashboard.quickActions')}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { to: `/app/organizations/${focus.id}/content?tab=courses`, label: t('workspace.nav.courses'), icon: BookOpen },
                    { to: `/app/organizations/${focus.id}/content?tab=banks`, label: t('workspace.nav.banks'), icon: Library },
                    { to: `/app/organizations/${focus.id}/exams`, label: t('workspace.nav.exams'), icon: ClipboardList },
                    { to: `/app/organizations/${focus.id}/analytics`, label: t('workspace.nav.analytics'), icon: BarChart3 },
                  ].map(({ to, label, icon: Icon }) => (
                    <Link key={to} to={to} className="group">
                      <Card className="h-full border-border/60 transition-all group-hover:border-primary/40">
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

            {!isStaff && focus && (
              <section>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">
                  {t('dashboard.quickActions')}
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Link to={`/app/organizations/${focus.id}/exams`}>
                    <Card className="border-border/60">
                      <CardContent className="flex items-center gap-3 pt-5">
                        <ClipboardList className="h-5 w-5 text-primary" />
                        <span className="font-medium">{t('dashboard.availableExams')}</span>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link to={`/app/organizations/${focus.id}/certificates`}>
                    <Card className="border-border/60">
                      <CardContent className="flex items-center gap-3 pt-5">
                        <Award className="h-5 w-5 text-primary" />
                        <span className="font-medium">{t('dashboard.myCertificates')}</span>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </section>
            )}

            <section>
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
                  {t('org.dashboardTitle')}
                </h3>
                <Link to="/app/organizations">
                  <Button variant="outline" size="sm">{t('org.manage')}</Button>
                </Link>
              </div>
              <ul className="divide-y divide-border rounded-xl border border-border bg-surface">
                {orgs.map((o) => (
                  <li key={o.id}>
                    <Link
                      to={`/app/organizations/${o.id}`}
                      className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-surface-subtle"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{o.name}</p>
                        <p className="text-xs text-muted">{o.slug}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {o.myRole && <Badge variant="info">{o.myRole}</Badge>}
                        <ArrowRight className="h-4 w-4 text-muted rtl:rotate-180" />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="text-base">{t('dashboard.account')}</CardTitle>
                <CardDescription>{user?.email}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2 text-sm">
                <Badge variant="info">{user?.role}</Badge>
                <span className="text-muted">
                  {user?.isEmailVerified ? t('dashboard.yes') : t('dashboard.pending')} —{' '}
                  {t('dashboard.emailVerified')}
                </span>
              </CardContent>
            </Card>
          </div>
        )}
      </Container>
    </div>
  )
}
