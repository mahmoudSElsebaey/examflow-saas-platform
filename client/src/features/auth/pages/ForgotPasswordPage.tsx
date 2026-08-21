import { useState } from 'react'
import { Link } from 'react-router-dom'
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

const schema = z.object({
  email: z.string().email('Invalid email'),
})

type FormData = z.infer<typeof schema>

export function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

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
      setError(err instanceof Error ? err.message : 'Request failed')
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border bg-surface">
        <Container>
          <div className="flex h-14 items-center">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                EF
              </span>
              <span className="font-semibold text-foreground">{appConfig.APP_NAME}</span>
            </Link>
          </div>
        </Container>
      </header>

      <main className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Reset password</CardTitle>
            <CardDescription>
              Enter your email and we&apos;ll send you a reset link
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4">
                <Alert variant="success">
                  <AlertDescription>
                    If an account exists with that email, a reset link has been sent.
                  </AlertDescription>
                </Alert>
                <Link to="/login">
                  <Button variant="outline" className="w-full">
                    Back to sign in
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
                  <Label htmlFor="email">Email</Label>
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
                  {isSubmitting ? 'Sending…' : 'Send reset link'}
                </Button>
                <p className="text-center text-sm text-muted">
                  <Link to="/login" className="font-medium text-primary hover:underline">
                    Back to sign in
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
