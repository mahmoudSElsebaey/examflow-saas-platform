import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, History } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { listActivityApi, type ActivityItem } from '../api/activityApi'
import * as orgApi from '@/features/organizations/api/orgApi'
import type { Organization } from '@/features/organizations/types'
import { isStaffRole } from '@/features/organizations/lib/roles'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Container } from '@/components/ui/Container'
import { Spinner } from '@/components/ui/Spinner'
import { AppHeader } from '@/components/layout/AppHeader'
import { OrgWorkspaceNav } from '@/components/layout/OrgWorkspaceNav'
import { OrgBrandScope } from '@/components/layout/OrgBrandScope'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

function formatWhen(iso: string, locale: string) {
  try {
    return new Date(iso).toLocaleString(locale === 'ar' ? 'ar' : 'en', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

export function OrgActivityPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const { t, i18n } = useTranslation()
  const { accessToken } = useAuth()
  const [org, setOrg] = useState<Organization | null>(null)
  const [items, setItems] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!accessToken || !orgId) return
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const [o, a] = await Promise.all([
          orgApi.getOrganizationApi(accessToken, orgId),
          listActivityApi(accessToken, orgId, 80),
        ])
        setOrg(o.data?.organization ?? null)
        setItems(a.data?.activity ?? [])
      } catch (err) {
        setError(err instanceof Error ? err.message : t('errors.generic'))
      } finally {
        setLoading(false)
      }
    })()
  }, [accessToken, orgId, t])

  if (!loading && org && !isStaffRole(org.myRole)) {
    return (
      <div className="min-h-screen bg-mesh">
        <AppHeader />
        <Container className="py-16">
          <Alert variant="error">
            <AlertDescription>{t('errors.unauthorized')}</AlertDescription>
          </Alert>
        </Container>
      </div>
    )
  }

  return (
    <OrgBrandScope branding={org?.branding}>
      <div className="min-h-screen bg-mesh">
        <AppHeader
          homeTo={orgId ? `/app/organizations/${orgId}` : '/app'}
          brandTitle={org?.name}
          logoUrl={org?.branding?.logoUrl}
        />
        <Container className="py-8">
          <Link
            to={`/app/organizations/${orgId}`}
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            {t('workspace.nav.overview')}
          </Link>
          <OrgWorkspaceNav role={org?.myRole} />

          <div className="mb-6 flex items-center gap-3">
            <History className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">
                {t('activity.title', { defaultValue: 'Activity' })}
              </h1>
              <p className="text-sm text-muted">
                {t('activity.subtitle', {
                  defaultValue: 'Audit trail for team and organization changes',
                })}
              </p>
            </div>
          </div>

          {error && (
            <Alert variant="error" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : (
            <Card className="border-border/60">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">
                  {t('activity.recent', { defaultValue: 'Recent events' })}
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (!accessToken || !orgId) return
                    void listActivityApi(accessToken, orgId, 80).then((a) =>
                      setItems(a.data?.activity ?? [])
                    )
                  }}
                >
                  {t('common.refresh', { defaultValue: 'Refresh' })}
                </Button>
              </CardHeader>
              <CardContent>
                {!items.length ? (
                  <p className="text-sm text-muted">
                    {t('activity.empty', {
                      defaultValue: 'No activity recorded yet. Team changes will appear here.',
                    })}
                  </p>
                ) : (
                  <ul className="divide-y divide-border">
                    {items.map((item) => (
                      <li key={item.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <Badge variant="info">{item.action}</Badge>
                            {item.actorName && (
                              <span className="text-xs text-muted">{item.actorName}</span>
                            )}
                          </div>
                          <p className="text-sm text-foreground">{item.summary}</p>
                        </div>
                        <time className="shrink-0 text-xs text-muted">
                          {formatWhen(item.createdAt, i18n.language)}
                        </time>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          )}
        </Container>
      </div>
    </OrgBrandScope>
  )
}
