import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { appConfig } from '@/config/app'
import { useAuth } from '../AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'
import { useToast } from '@/components/ui/Toast'

const DEMO = [
  { role: 'Platform Admin', email: 'admin@demo.examflow', password: 'Demo1234!' },
  { role: 'Owner', email: 'owner@demo.examflow', password: 'Demo1234!' },
  { role: 'Teacher', email: 'teacher@demo.examflow', password: 'Demo1234!' },
  { role: 'Student', email: 'student@demo.examflow', password: 'Demo1234!' },
]

export function LoginPage() {
  const { t } = useTranslation()
  const toast = useToast()
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/app'
  const [error, setError] = useState<string | null>(null)

  const schema = z.object({
    email: z.string().email(t('validation.invalidEmail')),
    password: z.string().min(1, t('validation.passwordRequired')),
  })

  type FormData = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: 'owner@demo.examflow',
      password: 'Demo1234!',
    },
  })

  const onSubmit = async (data: FormData) => {
    setError(null)
    try {
      await login(data.email, data.password)
      navigate(from, { replace: true })
    } catch (err) {
      toast.fromError(err)
      setError(t('auth.loginFailed'))
    }
  }

  const fillDemo = (acc: (typeof DEMO)[0]) => {
    setValue('email', acc.email, { shouldValidate: true })
    setValue('password', acc.password, { shouldValidate: true })
    setError(null)
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
            <CardTitle className="text-2xl">{t('auth.welcomeBack')}</CardTitle>
            <CardDescription>{t('auth.signInSubtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
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
                  autoComplete="email"
                  error={!!errors.email}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-error">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="password">{t('auth.password')}</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    {t('auth.forgotPassword')}
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  error={!!errors.password}
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-xs text-error">{errors.password.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? t('auth.signingIn') : t('auth.signIn')}
              </Button>
            </form>

            {/* Demo / test accounts */}
            <div className="mt-6 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Test accounts
              </p>
              <p className="text-xs text-muted">
                Password for all: <span className="font-mono">Demo1234!</span>
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {DEMO.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => fillDemo(acc)}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-start text-sm transition hover:border-primary/40 hover:bg-primary/5"
                  >
                    <span className="font-medium text-primary">{acc.role}</span>
                    <p className="mt-0.5 font-mono text-xs text-muted">{acc.email}</p>
                  </button>
                ))}
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-muted">
              {t('auth.noAccount')}{' '}
              <Link to="/register" className="font-medium text-primary hover:underline">
                {t('auth.createOne')}
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
