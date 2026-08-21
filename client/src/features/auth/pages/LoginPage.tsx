import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
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

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

type FormData = z.infer<typeof schema>

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/app'
  const [error, setError] = useState<string | null>(null)

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
      await login(data.email, data.password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
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
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in to your ExamFlow account</CardDescription>
          </CardHeader>
          <CardContent>
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
                  autoComplete="email"
                  error={!!errors.email}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-error">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Forgot password?
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
                {isSubmitting ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="font-medium text-primary hover:underline">
                Create one
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
