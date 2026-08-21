import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

const schema = z
  .object({
    firstName: z.string().min(1, 'First name is required').max(100),
    lastName: z.string().min(1, 'Last name is required').max(100),
    email: z.string().email('Invalid email'),
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Za-z]/, 'Must contain a letter')
      .regex(/[0-9]/, 'Must contain a number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

export function RegisterPage() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
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
      await registerUser({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      })
      navigate('/app', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
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
            <CardTitle className="text-2xl">Create your account</CardTitle>
            <CardDescription>Start using ExamFlow for free</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {error && (
                <Alert variant="error">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" error={!!errors.firstName} {...register('firstName')} />
                  {errors.firstName && (
                    <p className="text-xs text-error">{errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" error={!!errors.lastName} {...register('lastName')} />
                  {errors.lastName && (
                    <p className="text-xs text-error">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

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
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  error={!!errors.password}
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-xs text-error">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  error={!!errors.confirmPassword}
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-error">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Creating account…' : 'Create account'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
