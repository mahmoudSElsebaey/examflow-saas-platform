import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BarChart3, BookOpen, ClipboardList, Target, Users } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import * as orgApi from '@/features/organizations/api/orgApi'
import { getOrgAnalyticsApi, type OrgAnalytics } from '../api/analyticsApi'
import type { Organization } from '@/features/organizations/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Spinner } from '@/components/ui/Spinner'
import { OrgWorkspaceLayout } from '@/components/layout/OrgWorkspaceLayout'

export function OrgAnalyticsPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const { t } = useTranslation()
  const { accessToken } = useAuth()
  const [org, setOrg] = useState<Organization | null>(null)
  const [data, setData] = useState<OrgAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!accessToken || !orgId) return
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const [orgRes, analyticsRes] = await Promise.all([
          orgApi.getOrganizationApi(accessToken, orgId),
          getOrgAnalyticsApi(accessToken, orgId),
        ])
        setOrg(orgRes.data?.organization ?? null)
        setData(analyticsRes.data?.analytics ?? null)
      } catch (err) {
        setError(err instanceof Error ? err.message : t('errors.generic'))
      } finally {
        setLoading(false)
      }
    })()
  }, [accessToken, orgId, t])

  if (!orgId) return null

  const stats = data
    ? [
        {
          label: t('analytics.exams'),
          value: data.examsCount,
          sub: `${data.publishedExamsCount} ${t('analytics.published')}`,
          icon: ClipboardList,
        },
        {
          label: t('analytics.questions'),
          value: data.questionsCount,
          sub: t('analytics.inBanks'),
          icon: BookOpen,
        },
        {
          label: t('analytics.attempts'),
          value: data.attemptsCount,
          sub: `${data.completedAttemptsCount} ${t('analytics.completed')}`,
          icon: Users,
        },
        {
          label: t('analytics.avgScore'),
          value: data.averagePercent != null ? `${data.averagePercent}%` : '—',
          sub:
            data.passRate != null
              ? `${data.passRate}% ${t('analytics.passRate')}`
              : t('analytics.noData'),
          icon: Target,
        },
      ]
    : []

  return (
    <OrgWorkspaceLayout
      orgId={orgId}
      orgName={org?.name}
      role={org?.myRole}
      branding={org?.branding}
    >
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-muted text-primary">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t('analytics.title')}
          </h1>
          <p className="text-sm text-muted">{t('analytics.subtitle')}</p>
        </div>
      </div>

      {error && (
        <Alert variant="error" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(({ label, value, sub, icon: Icon }) => (
              <Card key={label} className="border-border/60">
                <CardContent className="pt-6">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary-muted text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{value}</p>
                  <p className="text-sm font-medium text-foreground">{label}</p>
                  <p className="mt-0.5 text-xs text-muted">{sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">{t('analytics.recentAttempts')}</CardTitle>
            </CardHeader>
            <CardContent>
              {!data?.recentAttempts?.length ? (
                <p className="text-sm text-muted">{t('analytics.noAttempts')}</p>
              ) : (
                <ul className="divide-y divide-border">
                  {data.recentAttempts.map((a) => (
                    <li
                      key={a.id}
                      className="flex flex-wrap items-center justify-between gap-2 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{a.examTitle}</p>
                        <p className="text-xs text-muted">{a.status}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {a.percent != null && <Badge variant="info">{a.percent}%</Badge>}
                        {a.passed != null && (
                          <Badge variant={a.passed ? 'success' : 'error'}>
                            {a.passed ? t('exam.passed') : t('exam.failed')}
                          </Badge>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </OrgWorkspaceLayout>
  )
}
