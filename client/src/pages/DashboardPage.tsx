import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Building2, ArrowRight } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import * as orgApi from '@/features/organizations/api/orgApi'
import type { Organization } from '@/features/organizations/types'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Container } from '@/components/ui/Container'
import { Spinner } from '@/components/ui/Spinner'
import { AppHeader } from '@/components/layout/AppHeader'

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

  return (
    <div className="min-h-screen bg-mesh">
      <AppHeader />

      <Container className="py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t('dashboard.welcome', { name: user?.firstName || '' })}
          </h1>
          <p className="mt-1 text-muted">{t('phase9.dashboardSubtitle')}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="border-border/60 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base">{t('dashboard.account')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-muted">{t('dashboard.email')}</span>
                <span className="font-medium text-foreground">{user?.email}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted">{t('dashboard.role')}</span>
                <Badge variant="info">{user?.role}</Badge>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted">{t('dashboard.emailVerified')}</span>
                <span>
                  {user?.isEmailVerified ? t('dashboard.yes') : t('dashboard.pending')}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-base">{t('org.dashboardTitle')}</CardTitle>
                <CardDescription>{t('org.dashboardBody')}</CardDescription>
              </div>
              <Link to="/app/organizations">
                <Button size="sm" className="gap-1">
                  {t('org.manage')}
                  <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : orgs.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center">
                  <Building2 className="mx-auto mb-3 h-8 w-8 text-muted" />
                  <p className="text-sm font-medium text-foreground">{t('org.emptyTitle')}</p>
                  <p className="mt-1 text-sm text-muted">{t('org.emptyBody')}</p>
                  <Link to="/app/organizations" className="mt-4 inline-block">
                    <Button size="sm">{t('org.create')}</Button>
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {orgs.slice(0, 5).map((o) => (
                    <li key={o.id}>
                      <Link
                        to={`/app/organizations/${o.id}`}
                        className="flex items-center justify-between gap-3 py-3 transition-colors hover:text-primary"
                      >
                        <div>
                          <p className="text-sm font-semibold text-foreground">{o.name}</p>
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
              )}
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  )
}
