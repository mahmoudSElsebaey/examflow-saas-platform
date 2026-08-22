import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import * as adminApi from '../api'
import { AppHeader } from '@/components/layout/AppHeader'
import { Container } from '@/components/ui/Container'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { Alert, AlertDescription } from '@/components/ui/Alert'

export function AdminPage() {
  const { user, accessToken } = useAuth()
  const [metrics, setMetrics] = useState<Record<string, number> | null>(null)
  const [orgs, setOrgs] = useState<
    {
      id: string
      name: string
      plan: string
      isActive: boolean
      ownerEmail: string | null
      slug: string
    }[]
  >([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    if (!accessToken) return
    setLoading(true)
    setError(null)
    try {
      const [m, o] = await Promise.all([
        adminApi.adminMetricsApi(accessToken),
        adminApi.adminOrgsApi(accessToken),
      ])
      setMetrics((m.data as Record<string, number>) ?? null)
      setOrgs(o.data?.organizations ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [accessToken])

  if (user?.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <Container className="py-12">
          <Alert variant="error">
            <AlertDescription>Super admin access required.</AlertDescription>
          </Alert>
          <Link to="/app" className="mt-4 inline-block text-primary underline">
            Back to app
          </Link>
        </Container>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <Container className="space-y-6 py-8">
        <h1 className="text-2xl font-bold">Platform Admin</h1>
        {error && (
          <Alert variant="error">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {loading ? (
          <Spinner />
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {metrics &&
                Object.entries(metrics).map(([k, v]) => (
                  <Card key={k}>
                    <CardContent className="py-4">
                      <p className="text-xs uppercase text-muted">{k}</p>
                      <p className="text-2xl font-bold">{v}</p>
                    </CardContent>
                  </Card>
                ))}
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Organizations</h2>
              {orgs.map((o) => (
                <Card key={o.id}>
                  <CardContent className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <div>
                      <p className="font-medium">
                        {o.name}{' '}
                        <span className="text-xs text-muted">({o.slug})</span>
                      </p>
                      <p className="text-xs text-muted">{o.ownerEmail}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="info">{o.plan}</Badge>
                      <Badge variant={o.isActive ? 'success' : 'warning'}>
                        {o.isActive ? 'active' : 'suspended'}
                      </Badge>
                      {o.isActive ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            void adminApi.adminSuspendOrgApi(accessToken!, o.id).then(load)
                          }
                        >
                          Suspend
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() =>
                            void adminApi.adminActivateOrgApi(accessToken!, o.id).then(load)
                          }
                        >
                          Activate
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </Container>
    </div>
  )
}
