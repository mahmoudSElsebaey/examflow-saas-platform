import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { appConfig } from '@/config/app'
import { forgotPasswordApi } from '../api/authApi'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'

export function ForgotPasswordPage() {
  const { t } = useTranslation()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const schema = z.object({
    email: z.string().email(t('validation.invalidEmail')),
  })

  type FormData = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError(null)
    try {
      await forgotPasswordApi(data.email)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.requestFailed'))
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-surface">
        <Container>
          <div className="flex h-14 items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                EF
              </span>
              <span className="font-semibold text-foreground">{appConfig.APP_NAME}</span>
            </Link>
            <LanguageSwitcher variant="compact" />
          </div>
        </Container>
      </header>

      <main className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t('auth.resetPassword')}</CardTitle>
            <CardDescription>{t('auth.resetSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4">
                <Alert variant="success">
                  <AlertDescription>{t('auth.resetSent')}</AlertDescription>
                </Alert>
                <Link to="/login">
                  <Button variant="outline" className="w-full">
                    {t('auth.backToSignIn')}
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                {error && (
                  <Alert variant="error">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">{t('auth.email')}</Label>
                  <Input
                    id="email"
                    type="email"
                    error={!!errors.email}
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-xs text-error">{errors.email.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? t('auth.sending') : t('auth.sendReset')}
                </Button>
                <p className="text-center text-sm text-muted">
                  <Link to="/login" className="font-medium text-primary hover:underline">
                    {t('auth.backToSignIn')}
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
