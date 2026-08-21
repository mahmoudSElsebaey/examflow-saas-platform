import { useAuth } from '@/features/auth/AuthContext'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { Badge } from '@/components/ui/Badge'
import { appConfig } from '@/config/app'
import { Link } from 'react-router-dom'

export function DashboardPage() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <Container>
          <div className="flex h-14 items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
                EF
              </span>
              <span className="font-semibold text-foreground">{appConfig.APP_NAME}</span>
            </Link>
            <div className="flex items-center gap-3">
              <span className="hidden text-sm text-muted sm:inline">
                {user?.firstName} {user?.lastName}
              </span>
              <Button variant="outline" size="sm" onClick={() => logout()}>
                Log out
              </Button>
            </div>
          </div>
        </Container>
      </header>

      <Container className="py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            Welcome, {user?.firstName}!
          </h1>
          <p className="mt-1 text-muted">
            This is your dashboard. Full exam features arrive in later phases.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="text-muted">Email:</span>{' '}
                <span className="font-medium">{user?.email}</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-muted">Role:</span>
                <Badge variant="info">{user?.role}</Badge>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-muted">Email verified:</span>
                <Badge variant={user?.isEmailVerified ? 'success' : 'warning'}>
                  {user?.isEmailVerified ? 'Yes' : 'Pending'}
                </Badge>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Coming next</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted">
              Organizations, courses, question banks, and the exam engine will be built in
              Phases 4–8.
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  )
}
