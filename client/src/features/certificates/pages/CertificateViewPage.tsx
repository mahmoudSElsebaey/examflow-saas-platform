import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Award } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { appConfig } from '@/config/app'
import type { Certificate } from '../api/certificateApi'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { Spinner } from '@/components/ui/Spinner'
import { Alert, AlertDescription } from '@/components/ui/Alert'

export function CertificateViewPage() {
  const { orgId, certId } = useParams<{ orgId: string; certId: string }>()
  const { t } = useTranslation()
  const { accessToken } = useAuth()
  const [cert, setCert] = useState<Certificate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!accessToken || !orgId || !certId) return
    ;(async () => {
      try {
        const res = await fetch(
          `${appConfig.API_BASE_URL}/organizations/${orgId}/certificates/${certId}`,
          {
            credentials: 'include',
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        )
        const json = await res.json()
        if (!res.ok) throw new Error(json.message || 'Failed')
        setCert(json.data?.certificate ?? null)
      } catch (err) {
        setError(err instanceof Error ? err.message : t('errors.generic'))
      } finally {
        setLoading(false)
      }
    })()
  }, [accessToken, orgId, certId, t])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (error || !cert) {
    return (
      <Container className="py-16">
        <Alert variant="error">
          <AlertDescription>{error || t('cert.notFound')}</AlertDescription>
        </Alert>
      </Container>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <Container>
        <Card className="mx-auto max-w-2xl overflow-hidden border-2 border-primary/30">
          <div className="bg-gradient-to-r from-primary to-primary-800 px-8 py-6 text-primary-foreground">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8" />
              <div>
                <p className="text-sm opacity-90">{appConfig.APP_NAME}</p>
                <h1 className="text-xl font-bold">{t('cert.certificateOf')}</h1>
              </div>
            </div>
          </div>
          <CardContent className="space-y-6 px-8 py-10 text-center">
            <p className="text-sm text-muted">{t('cert.awardedTo')}</p>
            <p className="text-3xl font-bold tracking-tight text-foreground">
              {cert.recipientName}
            </p>
            <p className="text-sm text-muted">{t('cert.forCompleting')}</p>
            <p className="text-xl font-semibold text-primary">{cert.examTitle}</p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div>
                <p className="text-muted">{t('cert.score')}</p>
                <p className="font-semibold">
                  {cert.score}/{cert.maxScore} ({cert.percent}%)
                </p>
              </div>
              <div>
                <p className="text-muted">{t('cert.issued')}</p>
                <p className="font-semibold">
                  {new Date(cert.issuedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            {cert.organizationName && (
              <p className="text-sm text-muted">{cert.organizationName}</p>
            )}
            <p className="font-mono text-xs text-muted">
              {t('cert.code')}: {cert.code}
            </p>
            <Link to={`/verify/${cert.code}`}>
              <Button variant="outline" size="sm">
                {t('cert.verifyLink')}
              </Button>
            </Link>
          </CardContent>
        </Card>
        <div className="mt-6 text-center">
          <Link to={`/app/organizations/${orgId}/certificates`}>
            <Button variant="ghost">{t('cert.backList')}</Button>
          </Link>
        </div>
      </Container>
    </div>
  )
}
