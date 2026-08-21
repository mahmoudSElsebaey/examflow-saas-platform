import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Award } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { listCertificatesApi, type Certificate } from '../api/certificateApi'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Container } from '@/components/ui/Container'
import { Spinner } from '@/components/ui/Spinner'
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'
import { appConfig } from '@/config/app'

export function OrgCertificatesPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const { t } = useTranslation()
  const { accessToken, logout } = useAuth()
  const [certs, setCerts] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!accessToken || !orgId) return
    ;(async () => {
      setLoading(true)
      try {
        const res = await listCertificatesApi(accessToken, orgId)
        setCerts(res.data?.certificates ?? [])
      } catch (err) {
        setError(err instanceof Error ? err.message : t('errors.generic'))
      } finally {
        setLoading(false)
      }
    })()
  }, [accessToken, orgId, t])

  return (
    <div className="min-h-screen bg-mesh">
      <header className="sticky top-0 z-40 border-b border-border/50 glass">
        <Container>
          <div className="flex h-14 items-center justify-between gap-3">
            <Link to="/app" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-800 text-xs font-bold text-primary-foreground">
                EF
              </span>
              <span className="font-bold text-foreground">{appConfig.APP_NAME}</span>
            </Link>
            <div className="flex items-center gap-3">
              <LanguageSwitcher variant="compact" />
              <Button variant="outline" size="sm" onClick={() => logout()}>
                {t('common.logOut')}
              </Button>
            </div>
          </div>
        </Container>
      </header>

      <Container className="py-10">
        <Link
          to={`/app/organizations/${orgId}`}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t('cert.backToOrg')}
        </Link>

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
      </Container>
    </div>
  )
}
