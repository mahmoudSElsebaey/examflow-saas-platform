import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/components/ui/Toast'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Settings } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import * as orgApi from '../api/orgApi'
import type { Organization, OrgMember } from '../types'
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
  const navigate = useNavigate()
  const { t } = useTranslation()
  const toast = useToast()
  const { accessToken } = useAuth()
  const [org, setOrg] = useState<Organization | null>(null)
  const [members, setMembers] = useState<OrgMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [transferring, setTransferring] = useState(false)

  const schema = z.object({
    name: z.string().min(2).optional(),
    primaryColor: z.string().regex(/^#([0-9A-Fa-f]{6})$/).or(z.literal('')).optional(),
    logoUrl: z.string().optional(),
  })
  type Form = z.infer<typeof schema>

  const { register, handleSubmit, setValue, watch, reset, formState: { isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (!accessToken || !orgId) return
    ;(async () => {
      try {
        const [res, m] = await Promise.all([
          orgApi.getOrganizationApi(accessToken, orgId),
          orgApi.listMembersApi(accessToken, orgId).catch(() => null),
        ])
        const o = res.data?.organization ?? null
        setOrg(o)
        setMembers(m?.data?.members ?? [])
        if (o) {
          reset({
            name: o.name,
            primaryColor: o.branding?.primaryColor ?? '',
            logoUrl: o.branding?.logoUrl ?? '',
          })
        }
      } catch (err) {
        toast.fromError(err); setError(t('errors.generic'))
      } finally {
        setLoading(false)
      }
    })()
  }, [accessToken, orgId, reset, t])

  const onSave = async (data: Form) => {
    if (!accessToken || !orgId) return
    setSaved(false)
    setError(null)
    try {
      const res = await orgApi.updateOrganizationApi(accessToken, orgId, {
        name: data.name,
        primaryColor: data.primaryColor || null,
        logoUrl: data.logoUrl || null,
      })
      if (res.data?.organization) setOrg(res.data.organization)
      setSaved(true); toast.success(t('toast.saved'))
    } catch (err) {
      toast.fromError(err); setError(t('errors.generic'))
    }
  }

  const onLogoFile = (file: File | null) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError(t('whiteLabel.invalidImage', { defaultValue: 'Please choose an image file' }))
      return
    }
    if (file.size > 200_000) {
      setError(t('whiteLabel.logoTooLarge', { defaultValue: 'Image max 200KB' }))
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      setValue('logoUrl', result)
    }
    reader.readAsDataURL(file)
  }

  const onLeave = async () => {
    if (!accessToken || !orgId) return
    if (!window.confirm(t('org.confirmLeave', { defaultValue: 'Leave this organization?' }))) return
    setLeaving(true)
    setError(null)
    try {
      await orgApi.leaveOrganizationApi(accessToken, orgId)
      navigate('/app/organizations')
    } catch (err) {
      toast.fromError(err); setError(t('errors.generic'))
    } finally {
      setLeaving(false)
    }
  }

  const onTransfer = async (membershipId: string) => {
    if (!accessToken || !orgId) return
    if (!window.confirm(t('org.confirmTransfer', { defaultValue: 'Transfer ownership to this member?' }))) return
    setTransferring(true)
    setError(null)
    try {
      const res = await orgApi.transferOwnershipApi(accessToken, orgId, membershipId)
      if (res.data?.organization) setOrg(res.data.organization)
      const m = await orgApi.listMembersApi(accessToken, orgId)
      setMembers(m.data?.members ?? [])
    } catch (err) {
      toast.fromError(err); setError(t('errors.generic'))
    } finally {
      setTransferring(false)
    }
  }

  const logoPreview = watch('logoUrl')
  const isOwner = org?.myRole === 'owner'

  if (!loading && org && !canManageMembers(org.myRole) && org.myRole !== 'teacher' && org.myRole !== 'examiner' && org.myRole !== 'student') {
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
            <div className="mx-auto grid max-w-2xl gap-6">
              {canManageMembers(org?.myRole) && (
                <Card className="border-border/60">
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
                        <Input id="logoUrl" placeholder={t('whiteLabel.logoPlaceholder')} {...register('logoUrl')} />
                        <input
                          type="file"
                          accept="image/*"
                          className="block w-full text-sm text-muted"
                          onChange={(e) => onLogoFile(e.target.files?.[0] ?? null)}
                        />
                        {logoPreview && logoPreview.startsWith('data:image') && (
                          <img src={logoPreview} alt={t('whiteLabel.logoPreview')} className="mt-2 h-12 w-12 rounded-lg object-contain border border-border" />
                        )}
                      </div>
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? t('common.loading') : t('common.save')}
                      </Button>
                      {saved && <p className="text-center text-xs text-success">{t('whiteLabel.saved')}</p>}
                    </form>
                  </CardContent>
                </Card>
              )}

              {isOwner && (
                <Card className="border-border/60">
                  <CardHeader>
                    <CardTitle className="text-base">
                      {t('org.transferTitle', { defaultValue: 'Transfer ownership' })}
                    </CardTitle>
                    <CardDescription>
                      {t('org.transferHint', {
                        defaultValue: 'Choose an active member to become the new owner. You will become admin.',
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {members
                      .filter((m) => m.role !== 'owner' && m.status === 'active')
                      .map((m) => (
                        <div key={m.id} className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
                          <span className="text-sm">
                            {m.firstName} {m.lastName} <span className="text-muted">({t(`roles.${m.role}`)})</span>
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={transferring}
                            onClick={() => void onTransfer(m.id)}
                          >
                            {t('org.makeOwner', { defaultValue: 'Make owner' })}
                          </Button>
                        </div>
                      ))}
                    {!members.some((m) => m.role !== 'owner' && m.status === 'active') && (
                      <p className="text-sm text-muted">
                        {t('org.noTransferTargets', { defaultValue: 'Invite another member first.' })}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {org?.myRole && org.myRole !== 'owner' && (
                <Card className="border-border/60">
                  <CardHeader>
                    <CardTitle className="text-base">
                      {t('org.leaveTitle', { defaultValue: 'Leave organization' })}
                    </CardTitle>
                    <CardDescription>
                      {t('org.leaveHint', {
                        defaultValue: 'You will lose access until invited again.',
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="text-destructive" disabled={leaving} onClick={() => void onLeave()}>
                      {leaving ? t('common.loading') : t('org.leave', { defaultValue: 'Leave organization' })}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </Container>
      </div>
    </OrgBrandScope>
  )
}
