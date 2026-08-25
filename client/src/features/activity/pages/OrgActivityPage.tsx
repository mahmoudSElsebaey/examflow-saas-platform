import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { History } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { listActivityApi, type ActivityItem } from '../api/activityApi'
import * as orgApi from '@/features/organizations/api/orgApi'
import type { Organization } from '@/features/organizations/types'
import { isStaffRole } from '@/features/organizations/lib/roles'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Spinner } from '@/components/ui/Spinner'
import { OrgWorkspaceLayout } from '@/components/layout/OrgWorkspaceLayout'
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

  if (!orgId) return null

  if (!loading && org && !isStaffRole(org.myRole)) {
    return (
      <OrgWorkspaceLayout orgId={orgId} orgName={org.name} role={org.myRole} branding={org.branding}>
        <Alert variant="error">
          <AlertDescription>{t('errors.forbidden')}</AlertDescription>
        </Alert>
      </OrgWorkspaceLayout>
    )
  }

  return (
    <OrgWorkspaceLayout
      orgId={orgId}
      orgName={org?.name}
      role={org?.myRole}
      branding={org?.branding}
    >
      <div className="mb-6 flex items-center gap-3">
        <History className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">{t('activity.title')}</h1>
          <p className="text-sm text-muted">{t('activity.subtitle')}</p>
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
            <CardTitle className="text-base">{t('activity.recent')}</CardTitle>
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
              <p className="text-sm text-muted">{t('activity.empty')}</p>
            ) : (
              <ul className="divide-y divide-border">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:justify-between"
                  >
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
    </OrgWorkspaceLayout>
  )
}
