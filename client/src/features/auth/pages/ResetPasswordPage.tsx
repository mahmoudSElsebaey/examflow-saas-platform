import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import * as authApi from '../api/authApi'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent } from '@/components/ui/Card'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Container } from '@/components/ui/Container'
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'

const schema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'mismatch',
    path: ['confirmPassword'],
  })

type Form = z.infer<typeof schema>

export function ResetPasswordPage() {
  const { t } = useTranslation()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') || ''
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const onSubmit = form.handleSubmit(async (data) => {
    setError(null)
    if (!token) {
      setError(t('auth.invalidResetToken'))
      return
    }
    try {
      await authApi.resetPasswordApi(token, data.password)
      setDone(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.generic'))
    }
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="flex justify-end p-4">
        <LanguageSwitcher />
      </div>
      <Container className="flex justify-center py-12">
        <Card className="w-full max-w-md border-border/60">
          <CardContent className="space-y-6 pt-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t('auth.setNewPassword')}</h1>
              <p className="mt-1 text-sm text-muted">{t('auth.setNewPasswordHint')}</p>
            </div>

            {!token && (
              <Alert variant="error">
                <AlertDescription>{t('auth.invalidResetToken')}</AlertDescription>
              </Alert>
            )}

            {done ? (
              <Alert variant="success">
                <AlertDescription>{t('auth.passwordUpdated')}</AlertDescription>
              </Alert>
            ) : (
              <form className="space-y-4" onSubmit={onSubmit}>
                {error && (
                  <Alert variant="error">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="password">{t('auth.password')}</Label>
                  <Input id="password" type="password" {...form.register('password')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...form.register('confirmPassword')}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={!token || form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? t('common.loading') : t('auth.updatePassword')}
                </Button>
              </form>
            )}

            <p className="text-center text-sm text-muted">
              <Link to="/login" className="text-primary hover:underline">
                {t('auth.backToSignIn')}
              </Link>
            </p>
          </CardContent>
        </Card>
      </Container>
    </div>
  )
}
