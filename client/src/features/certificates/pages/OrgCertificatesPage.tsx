import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Award } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import * as orgApi from '@/features/organizations/api/orgApi'
import { listCertificatesApi, type Certificate } from '../api/certificateApi'
import type { Organization } from '@/features/organizations/types'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Spinner } from '@/components/ui/Spinner'
import { OrgWorkspaceLayout } from '@/components/layout/OrgWorkspaceLayout'

export function OrgCertificatesPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const { t } = useTranslation()
  const { accessToken } = useAuth()
  const [org, setOrg] = useState<Organization | null>(null)
  const [certs, setCerts] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!accessToken || !orgId) return
    ;(async () => {
      setLoading(true)
      try {
        const [orgRes, certRes] = await Promise.all([
          orgApi.getOrganizationApi(accessToken, orgId),
          listCertificatesApi(accessToken, orgId),
        ])
        setOrg(orgRes.data?.organization ?? null)
        setCerts(certRes.data?.certificates ?? [])
      } catch (err) {
        setError(err instanceof Error ? err.message : t('errors.generic'))
      } finally {
        setLoading(false)
      }
    })()
  }, [accessToken, orgId, t])

  if (!orgId) return null

  return (
    <OrgWorkspaceLayout
      orgId={orgId}
      orgName={org?.name}
      role={org?.myRole}
      branding={org?.branding}
    >
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-muted text-primary">
          <Award className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('cert.title')}</h1>
          <p className="text-sm text-muted">{t('cert.subtitle')}</p>
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
        <div className="grid gap-4 sm:grid-cols-2">
          {certs.map((c) => (
            <Card key={c.id} className="border-border/60">
              <CardContent className="pt-6">
                <div className="mb-2 flex items-start justify-between">
                  <Award className="h-8 w-8 text-primary" />
                  <Badge variant="success">{c.percent}%</Badge>
                </div>
                <h3 className="font-semibold text-foreground">{c.examTitle}</h3>
                <p className="mt-1 text-sm text-muted">{c.recipientName}</p>
                <p className="mt-2 font-mono text-xs text-primary">{c.code}</p>
                <p className="mt-1 text-xs text-muted">
                  {new Date(c.issuedAt).toLocaleDateString()}
                </p>
                <Link
                  to={`/app/organizations/${orgId}/certificates/${c.id}`}
                  className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
                >
                  {t('cert.view')}
                </Link>
              </CardContent>
            </Card>
          ))}
          {certs.length === 0 && (
            <p className="text-sm text-muted sm:col-span-2">{t('cert.empty')}</p>
          )}
        </div>
      )}
    </OrgWorkspaceLayout>
  )
}
