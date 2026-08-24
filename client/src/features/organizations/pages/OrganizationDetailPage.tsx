import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Palette, Users } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import * as orgApi from '../api/orgApi'
import type { Organization, OrgMember } from '../types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Container } from '@/components/ui/Container'
import { Spinner } from '@/components/ui/Spinner'
import { AppHeader } from '@/components/layout/AppHeader'
import { OrgModuleGrid } from '@/components/layout/OrgModuleGrid'
import { OrgSubNav } from '@/components/layout/OrgSubNav'
import { OrgBrandScope } from '@/components/layout/OrgBrandScope'

export function OrganizationDetailPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const { t } = useTranslation()
  const { accessToken } = useAuth()
  const [org, setOrg] = useState<Organization | null>(null)
  const [members, setMembers] = useState<OrgMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [brandSaved, setBrandSaved] = useState(false)

  const canManage = org?.myRole === 'owner' || org?.myRole === 'admin'

  const inviteSchema = z.object({
    email: z.string().email(t('validation.invalidEmail')),
    role: z.enum(['admin', 'teacher', 'examiner', 'student']),
  })
  type InviteForm = z.infer<typeof inviteSchema>

  const brandSchema = z.object({
    primaryColor: z
      .string()
      .regex(/^#([0-9A-Fa-f]{6})$/, t('whiteLabel.invalidColor'))
      .or(z.literal(''))
      .optional(),
    logoUrl: z.string().url().or(z.literal('')).optional(),
  })
  type BrandForm = z.infer<typeof brandSchema>

  const inviteForm = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: 'teacher' },
  })

  const brandForm = useForm<BrandForm>({
    resolver: zodResolver(brandSchema),
    defaultValues: { primaryColor: '', logoUrl: '' },
  })

  const load = async () => {
    if (!accessToken || !orgId) return
    setLoading(true)
    setError(null)
    try {
      const [orgRes, membersRes] = await Promise.all([
        orgApi.getOrganizationApi(accessToken, orgId),
        orgApi.listMembersApi(accessToken, orgId),
      ])
      const organization = orgRes.data?.organization ?? null
      setOrg(organization)
      setMembers(membersRes.data?.members ?? [])
      if (organization) {
        brandForm.reset({
          primaryColor: organization.branding?.primaryColor ?? '',
          logoUrl: organization.branding?.logoUrl ?? '',
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [accessToken, orgId])

  const onInvite = async (data: InviteForm) => {
    if (!accessToken || !orgId) return
    try {
      await orgApi.inviteMemberApi(accessToken, orgId, data)
      inviteForm.reset({ email: '', role: 'teacher' })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.generic'))
    }
  }

  const onSaveBranding = async (data: BrandForm) => {
    if (!accessToken || !orgId) return
    setBrandSaved(false)
    try {
      const res = await orgApi.updateOrganizationApi(accessToken, orgId, {
        primaryColor: data.primaryColor ? data.primaryColor : null,
        logoUrl: data.logoUrl ? data.logoUrl : null,
      })
      const updated = res.data?.organization
      if (updated) setOrg(updated)
      setBrandSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.generic'))
    }
  }

  return (
    <OrgBrandScope branding={org?.branding}>
      <div className="min-h-screen bg-mesh">
        <AppHeader
          logoUrl={org?.branding?.logoUrl}
          brandTitle={org?.name}
          homeTo={orgId ? `/app/organizations/${orgId}` : '/app'}
        />

        <Container className="py-10">
          <Link
            to="/app/organizations"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            {t('org.backToList')}
          </Link>

          {loading ? (
            <div className="flex justify-center py-20">
              <Spinner />
            </div>
          ) : error && !org ? (
            <Alert variant="error">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : org ? (
            <>
              <div className="mb-6">
                <div className="flex flex-wrap items-center gap-3">
                  {org.branding?.logoUrl && (
                    <img
                      src={org.branding.logoUrl}
                      alt=""
                      className="h-12 w-12 rounded-xl border border-border object-contain bg-surface"
                    />
                  )}
                  <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {org.name}
                  </h1>
                  {org.myRole && <Badge variant="info">{org.myRole}</Badge>}
                  <Badge variant="success">{org.plan}</Badge>
                </div>
                {org.description && (
                  <p className="mt-2 max-w-2xl text-sm text-muted">{org.description}</p>
                )}
              </div>

              <OrgSubNav />

              {error && (
                <Alert variant="error" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <section className="mb-10">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
                  {t('phase9.workspace')}
                </h2>
                <OrgModuleGrid orgId={org.id} />
              </section>

              <div className="grid gap-6 lg:grid-cols-3">
                <Card className="border-border/60 lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Users className="h-4 w-4" />
                      {t('org.members')}
                    </CardTitle>
                    <CardDescription>{t('org.membersHint')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="divide-y divide-border">
                      {members.map((m) => (
                        <li
                          key={m.id}
                          className="flex flex-wrap items-center justify-between gap-2 py-3"
                        >
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {m.firstName} {m.lastName}
                            </p>
                            <p className="text-xs text-muted">{m.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="info">{m.role}</Badge>
                            <Badge
                              variant={m.status === 'active' ? 'success' : 'warning'}
                            >
                              {m.status}
                            </Badge>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  {canManage && (
                    <Card className="border-border/60">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Palette className="h-4 w-4" />
                          {t('whiteLabel.title')}
                        </CardTitle>
                        <CardDescription>{t('whiteLabel.hint')}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form
                          onSubmit={brandForm.handleSubmit(onSaveBranding)}
                          className="space-y-4"
                          noValidate
                        >
                          <div className="space-y-2">
                            <Label htmlFor="primaryColor">{t('whiteLabel.primaryColor')}</Label>
                            <div className="flex gap-2">
                              <Input
                                id="primaryColor"
                                placeholder="#0f766e"
                                {...brandForm.register('primaryColor')}
                              />
                              <input
                                type="color"
                                className="h-11 w-14 cursor-pointer rounded-lg border border-border bg-surface"
                                value={
                                  brandForm.watch('primaryColor')?.match(/^#[0-9A-Fa-f]{6}$/)
                                    ? brandForm.watch('primaryColor')!
                                    : '#0f766e'
                                }
                                onChange={(e) =>
                                  brandForm.setValue('primaryColor', e.target.value)
                                }
                                aria-label={t('whiteLabel.primaryColor')}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="logoUrl">{t('whiteLabel.logoUrl')}</Label>
                            <Input
                              id="logoUrl"
                              placeholder="https://…"
                              {...brandForm.register('logoUrl')}
                            />
                          </div>
                          <Button
                            type="submit"
                            className="w-full"
                            disabled={brandForm.formState.isSubmitting}
                          >
                            {brandForm.formState.isSubmitting
                              ? t('common.loading')
                              : t('whiteLabel.save')}
                          </Button>
                          {brandSaved && (
                            <p className="text-center text-xs text-success">
                              {t('whiteLabel.saved')}
                            </p>
                          )}
                        </form>
                      </CardContent>
                    </Card>
                  )}

                  {canManage && (
                    <Card className="border-border/60">
                      <CardHeader>
                        <CardTitle className="text-base">{t('org.inviteTitle')}</CardTitle>
                        <CardDescription>{t('org.inviteHint')}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form
                          onSubmit={inviteForm.handleSubmit(onInvite)}
                          className="space-y-4"
                          noValidate
                        >
                          <div className="space-y-2">
                            <Label htmlFor="email">{t('auth.email')}</Label>
                            <Input
                              id="email"
                              type="email"
                              {...inviteForm.register('email')}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="role">{t('org.role')}</Label>
                            <select
                              id="role"
                              className="flex h-11 w-full rounded-lg border border-border bg-surface px-3.5 text-sm"
                              {...inviteForm.register('role')}
                            >
                              <option value="admin">{t('roles.admin')}</option>
                              <option value="teacher">{t('roles.teacher')}</option>
                              <option value="examiner">{t('roles.examiner')}</option>
                              <option value="student">{t('roles.student')}</option>
                            </select>
                          </div>
                          <Button
                            type="submit"
                            className="w-full"
                            disabled={inviteForm.formState.isSubmitting}
                          >
                            {inviteForm.formState.isSubmitting
                              ? t('common.loading')
                              : t('org.invite')}
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </>
          ) : (
            <Alert variant="error">
              <AlertDescription>{t('org.notFound')}</AlertDescription>
            </Alert>
          )}
        </Container>
      </div>
    </OrgBrandScope>
  )
}
