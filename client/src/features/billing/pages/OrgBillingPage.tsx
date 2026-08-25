import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/features/auth/AuthContext'
import * as billingApi from '../api'
import * as orgApi from '@/features/organizations/api/orgApi'
import type { Organization } from '@/features/organizations/types'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Spinner } from '@/components/ui/Spinner'
import { OrgWorkspaceLayout } from '@/components/layout/OrgWorkspaceLayout'

export function OrgBillingPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const [searchParams] = useSearchParams()
  const { t } = useTranslation()
  const toast = useToast()
  const { accessToken } = useAuth()
  const [org, setOrg] = useState<Organization | null>(null)
  const [data, setData] = useState<billingApi.BillingData | null>(null)
  const [plans, setPlans] = useState<
    { id: string; priceMonthlyUsd: number; billingMode: string }[]
  >([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const load = async () => {
    if (!accessToken || !orgId) return
    setLoading(true)
    setError(null)
    try {
      const [o, b, p] = await Promise.all([
        orgApi.getOrganizationApi(accessToken, orgId),
        billingApi.getOrgBillingApi(accessToken, orgId),
        billingApi.listPlansApi(accessToken),
      ])
      setOrg(o.data?.organization ?? null)
      setData(b.data ?? null)
      setPlans(p.data?.plans ?? [])
    } catch (err) {
      toast.fromError(err)
      setError(t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [accessToken, orgId])

  useEffect(() => {
    const checkout = searchParams.get('checkout')
    if (checkout === 'success') setInfo(t('billing.checkoutSuccess'))
    if (checkout === 'cancel') setInfo(t('billing.checkoutCancel'))
  }, [searchParams, t])

  const onSelectPlan = async (planId: string) => {
    if (!accessToken || !orgId) return
    setBusy(true)
    setError(null)
    try {
      const res = await billingApi.changePlanApi(accessToken, orgId, planId)
      if (res.data?.checkoutUrl) {
        window.location.href = res.data.checkoutUrl
        return
      }
      await load()
    } catch (err) {
      toast.fromError(err)
      setError(t('errors.generic'))
    } finally {
      setBusy(false)
    }
  }

  const onPortal = async () => {
    if (!accessToken || !orgId) return
    setBusy(true)
    setError(null)
    try {
      const res = await billingApi.billingPortalApi(accessToken, orgId)
      if (res.data?.url) window.location.href = res.data.url
    } catch (err) {
      toast.fromError(err)
      setError(t('errors.generic'))
    } finally {
      setBusy(false)
    }
  }

  if (!orgId) return null
  const isStripe = data?.billingMode === 'stripe'

  return (
    <OrgWorkspaceLayout
      orgId={orgId}
      orgName={org?.name}
      role={org?.myRole}
      branding={org?.branding}
    >
      <h1 className="mb-4 text-2xl font-bold">{t('billing.title')}</h1>
      {error && (
        <Alert variant="error" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {info && (
        <Alert variant="info" className="mb-4">
          <AlertDescription>{info}</AlertDescription>
        </Alert>
      )}
      {loading || !data ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-2 py-6">
              <p>
                {t('billing.currentPlan')}: <Badge variant="info">{data.plan}</Badge>{' '}
                <span className="text-xs text-muted">
                  ({data.billingMode}
                  {data.stripeConfigured ? ' · Stripe' : ''})
                </span>
              </p>
              <p className="text-sm text-muted">
                {t('billing.usage')} — {t('billing.members')} {data.usage.members}/
                {String(data.limits.maxMembers)}, {t('billing.exams')} {data.usage.exams}/
                {String(data.limits.maxExams)}, {t('billing.questions')} {data.usage.questions}/
                {String(data.limits.maxQuestions)}
              </p>
              {isStripe && data.hasStripeCustomer && (
                <Button size="sm" variant="outline" disabled={busy} onClick={() => void onPortal()}>
                  {t('billing.manageSubscription')}
                </Button>
              )}
            </CardContent>
          </Card>
          <div className="grid gap-3 sm:grid-cols-3">
            {plans.map((p) => (
              <Card key={p.id}>
                <CardContent className="space-y-3 py-6">
                  <p className="text-lg font-semibold capitalize">{p.id}</p>
                  <p className="text-sm text-muted">
                    ${p.priceMonthlyUsd}
                    {t('billing.perMonth')}
                  </p>
                  <Button
                    size="sm"
                    disabled={busy || data.plan === p.id}
                    onClick={() => void onSelectPlan(p.id)}
                  >
                    {data.plan === p.id
                      ? t('billing.current')
                      : isStripe && p.id !== 'free'
                        ? t('billing.upgradeStripe')
                        : t('billing.selectMock')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-xs text-muted">
            {isStripe ? t('billing.stripeHint') : t('billing.mockHint')}
          </p>
        </div>
      )}
    </OrgWorkspaceLayout>
  )
}
