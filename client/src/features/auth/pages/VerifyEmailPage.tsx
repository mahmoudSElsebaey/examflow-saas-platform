import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import * as authApi from '../api/authApi'
import { useAuth } from '../AuthContext'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Container } from '@/components/ui/Container'
import { Spinner } from '@/components/ui/Spinner'
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'

export function VerifyEmailPage() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const { accessToken, user, setSession } = useAuth()
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)
  const [resending, setResending] = useState(false)

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage(t('auth.invalidVerifyToken'))
      return
    }
    setStatus('loading')
    authApi
      .verifyEmailApi(token)
      .then((res) => {
        if (res.data?.user && accessToken) {
          setSession(res.data.user, accessToken)
        }
        setStatus('ok')
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err instanceof Error ? err.message : t('errors.generic'))
      })
  }, [token, t, accessToken, setSession])

  const resend = async () => {
    if (!accessToken) return
    setResending(true)
    try {
      await authApi.resendVerificationApi(accessToken)
      setMessage(t('auth.verifyResent'))
    } catch (err) {
      setMessage(err instanceof Error ? err.message : t('errors.generic'))
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex justify-end p-4">
        <LanguageSwitcher />
      </div>
      <Container className="flex justify-center py-12">
        <Card className="w-full max-w-md border-border/60">
          <CardContent className="space-y-4 pt-8 text-center">
            <h1 className="text-2xl font-bold text-foreground">{t('auth.verifyEmailTitle')}</h1>

            {status === 'loading' && <Spinner className="mx-auto" />}
            {status === 'ok' && (
              <Alert variant="success">
                <AlertDescription>{t('auth.emailVerified')}</AlertDescription>
              </Alert>
            )}
            {status === 'error' && (
              <Alert variant="error">
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {user && !user.isEmailVerified && accessToken && (
              <Button variant="outline" onClick={() => void resend()} disabled={resending}>
                {resending ? t('common.loading') : t('auth.resendVerification')}
              </Button>
            )}

            <div className="flex flex-wrap justify-center gap-2 pt-2">
              <Link to="/app">
                <Button size="sm">{t('auth.continueToApp')}</Button>
              </Link>
              <Link to="/login">
                <Button size="sm" variant="outline">
                  {t('auth.backToSignIn')}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </Container>
    </div>
  )
}
