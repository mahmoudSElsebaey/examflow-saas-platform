import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Settings } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import * as orgApi from '../api/orgApi'
import type { Organization } from '../types'
import { canManageMembers } from '../lib/roles'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Container } from '@/components/ui/Container'
import { Spinner } from '@/components/ui/Spinner'
import { AppHeader } from '@/components/layout/AppHeader'
import { OrgWorkspaceNav } from '@/components/layout/OrgWorkspaceNav'
import { OrgBrandScope } from '@/components/layout/OrgBrandScope'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'

export function OrgSettingsPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const { t } = useTranslation()
  const { accessToken } = useAuth()
  const [org, setOrg] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const schema = z.object({
    name: z.string().min(2).optional(),
    primaryColor: z.string().regex(/^#([0-9A-Fa-f]{6})$/).or(z.literal('')).optional(),
    logoUrl: z.string().url().or(z.literal('')).optional(),
  })
  type Form = z.infer<typeof schema>

  const { register, handleSubmit, setValue, watch, reset, formState: { isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (!accessToken || !orgId) return
    ;(async () => {
      try {
        const res = await orgApi.getOrganizationApi(accessToken, orgId)
        const o = res.data?.organization ?? null
        setOrg(o)
        if (o) {
          reset({
            name: o.name,
            primaryColor: o.branding?.primaryColor ?? '',
            logoUrl: o.branding?.logoUrl ?? '',
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t('errors.generic'))
      } finally {
        setLoading(false)
      }
    })()
  }, [accessToken, orgId, reset, t])

  const onSave = async (data: Form) => {
    if (!accessToken || !orgId) return
    setSaved(false)
    try {
      const res = await orgApi.updateOrganizationApi(accessToken, orgId, {
        name: data.name,
        primaryColor: data.primaryColor || null,
        logoUrl: data.logoUrl || null,
      })
      if (res.data?.organization) setOrg(res.data.organization)
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.generic'))
    }
  }

  if (!loading && org && !canManageMembers(org.myRole)) {
    return (
      <div className="min-h-screen bg-mesh">
        <AppHeader />
        <Container className="py-16">
          <Alert variant="error">
            <AlertDescription>{t('errors.unauthorized')}</AlertDescription>
          </Alert>
        </Container>
      </div>
    )
  }

  return (
    <OrgBrandScope branding={org?.branding}>
      <div className="min-h-screen bg-mesh">
        <AppHeader homeTo={orgId ? `/app/organizations/${orgId}` : '/app'} brandTitle={org?.name} logoUrl={org?.branding?.logoUrl} />
        <Container className="py-8">
          <Link to={`/app/organizations/${orgId}`} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            {t('workspace.nav.overview')}
          </Link>
          <OrgWorkspaceNav role={org?.myRole} />
          <div className="mb-6 flex items-center gap-3">
            <Settings className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">{t('workspace.nav.settings')}</h1>
          </div>
          {error && (
            <Alert variant="error" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {loading ? (
            <div className="flex justify-center py-16"><Spinner /></div>
          ) : (
            <Card className="mx-auto max-w-lg border-border/60">
              <CardHeader>
                <CardTitle className="text-base">{t('whiteLabel.title')}</CardTitle>
                <CardDescription>{t('whiteLabel.hint')}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSave)} className="space-y-4" noValidate>
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('org.name')}</Label>
                    <Input id="name" {...register('name')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">{t('whiteLabel.primaryColor')}</Label>
                    <div className="flex gap-2">
                      <Input id="primaryColor" placeholder="#0f766e" {...register('primaryColor')} />
                      <input
                        type="color"
                        className="h-11 w-14 cursor-pointer rounded-lg border border-border"
                        value={watch('primaryColor')?.match(/^#[0-9A-Fa-f]{6}$/) ? watch('primaryColor')! : '#0f766e'}
                        onChange={(e) => setValue('primaryColor', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="logoUrl">{t('whiteLabel.logoUrl')}</Label>
                    <Input id="logoUrl" placeholder="https://…" {...register('logoUrl')} />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? t('common.loading') : t('common.save')}
                  </Button>
                  {saved && <p className="text-center text-xs text-success">{t('whiteLabel.saved')}</p>}
                </form>
              </CardContent>
            </Card>
          )}
        </Container>
      </div>
    </OrgBrandScope>
  )
}
