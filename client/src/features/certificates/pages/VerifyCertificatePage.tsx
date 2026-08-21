import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Award, CheckCircle2, XCircle } from 'lucide-react'
import { verifyCertificateApi, type Certificate } from '../api/certificateApi'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { Spinner } from '@/components/ui/Spinner'
import { appConfig } from '@/config/app'

export function VerifyCertificatePage() {
  const { code } = useParams<{ code: string }>()
  const { t } = useTranslation()
  const [cert, setCert] = useState<Certificate | null>(null)
  const [valid, setValid] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!code) return
    ;(async () => {
      try {
        const res = await verifyCertificateApi(code)
        setCert(res.data?.certificate ?? null)
        setValid(res.data?.valid ?? false)
      } catch {
        setValid(false)
        setCert(null)
      } finally {
        setLoading(false)
      }
    })()
  }, [code])

  return (
    <div className="min-h-screen bg-mesh py-16">
      <Container>
        <div className="mx-auto max-w-lg text-center">
          <Link to="/" className="mb-8 inline-flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-800 text-xs font-bold text-primary-foreground">
              EF
            </span>
            <span className="font-bold">{appConfig.APP_NAME}</span>
          </Link>

          <h1 className="mb-6 text-2xl font-bold text-foreground">
            {t('cert.verifyTitle')}
          </h1>

          {loading ? (
            <Spinner />
          ) : valid && cert ? (
            <Card className="border-success/40 text-start">
              <CardContent className="space-y-4 pt-8">
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle2 className="h-6 w-6" />
                  <span className="font-semibold">{t('cert.valid')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <span className="font-medium">{cert.examTitle}</span>
                </div>
                <p>
                  <span className="text-muted">{t('cert.awardedTo')}: </span>
                  {cert.recipientName}
                </p>
                <p>
                  <span className="text-muted">{t('cert.score')}: </span>
                  {cert.score}/{cert.maxScore} ({cert.percent}%)
                </p>
                <p className="font-mono text-sm text-primary">{cert.code}</p>
                {cert.organizationName && (
                  <p className="text-sm text-muted">{cert.organizationName}</p>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-error/40">
              <CardContent className="flex flex-col items-center gap-3 pt-8">
                <XCircle className="h-10 w-10 text-error" />
                <p className="font-semibold text-foreground">{t('cert.invalid')}</p>
                <p className="text-sm text-muted">{t('cert.invalidHint')}</p>
              </CardContent>
            </Card>
          )}

          <Link to="/" className="mt-8 inline-block">
            <Button variant="outline">{t('common.back')}</Button>
          </Link>
        </div>
      </Container>
    </div>
  )
}
