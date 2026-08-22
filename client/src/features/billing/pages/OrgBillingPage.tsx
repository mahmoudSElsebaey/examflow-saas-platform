import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import * as billingApi from '../api'
import { AppHeader } from '@/components/layout/AppHeader'
import { OrgWorkspaceNav } from '@/components/layout/OrgWorkspaceNav'
import { Container } from '@/components/ui/Container'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { Alert, AlertDescription } from '@/components/ui/Alert'

type BillingData = {
  plan: string
  billingMode: string
  limits: Record<string, number | boolean>
  usage: Record<string, number>
  canUpgrade: boolean
}

export function OrgBillingPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const { accessToken } = useAuth()
  const [data, setData] = useState<BillingData | null>(null)
  const [plans, setPlans] = useState<{ id: string; priceMonthlyUsd: number }[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    if (!accessToken || !orgId) return
    setLoading(true)
    setError(null)
    try {
      const [b, p] = await Promise.all([
        billingApi.getOrgBillingApi(accessToken, orgId),
        billingApi.listPlansApi(accessToken),
      ])
      setData(b.data ?? null)
      setPlans(p.data?.plans ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [accessToken, orgId])

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <Container className="py-6">
        <OrgWorkspaceNav />
        <h1 className="mb-4 mt-4 text-2xl font-bold">Billing & Plan</h1>
        {error && (
          <Alert variant="error" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {loading || !data ? (
          <Spinner />
        ) : (
          <div className="space-y-4">
            <Card>
              <CardContent className="space-y-2 py-6">
                <p>
                  Current plan: <Badge variant="info">{data.plan}</Badge>{' '}
                  <span className="text-xs text-muted">({data.billingMode})</span>
                </p>
                <p className="text-sm text-muted">
                  Usage — members {data.usage.members}/{String(data.limits.maxMembers)}, exams{' '}
                  {data.usage.exams}/{String(data.limits.maxExams)}, questions{' '}
                  {data.usage.questions}/{String(data.limits.maxQuestions)}
                </p>
              </CardContent>
            </Card>
            <div className="grid gap-3 sm:grid-cols-3">
              {plans.map((p) => (
                <Card key={p.id}>
                  <CardContent className="space-y-3 py-6">
                    <p className="text-lg font-semibold capitalize">{p.id}</p>
                    <p className="text-sm text-muted">${p.priceMonthlyUsd}/mo</p>
                    <Button
                      size="sm"
                      disabled={data.plan === p.id}
                      onClick={() =>
                        void billingApi.changePlanApi(accessToken!, orgId!, p.id).then(load)
                      }
                    >
                      {data.plan === p.id ? 'Current' : 'Select (mock)'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </Container>
    </div>
  )
}
