import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/components/ui/Toast'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, UserCog } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import * as orgApi from '../api/orgApi'
import type { OrgMember, Organization, OrgMemberRole } from '../types'
import { canManageMembers } from '../lib/roles'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Badge } from '@/components/ui/Badge'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Container } from '@/components/ui/Container'
import { Spinner } from '@/components/ui/Spinner'
import { AppHeader } from '@/components/layout/AppHeader'
import { OrgWorkspaceNav } from '@/components/layout/OrgWorkspaceNav'
import { OrgBrandScope } from '@/components/layout/OrgBrandScope'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'

const ROLE_OPTIONS: Exclude<OrgMemberRole, 'owner'>[] = [
  'admin',
  'teacher',
  'examiner',
  'student',
]

export function OrgMembersPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const { t } = useTranslation()
  const toast = useToast()
  const { accessToken } = useAuth()
  const [org, setOrg] = useState<Organization | null>(null)
  const [members, setMembers] = useState<OrgMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const canInvite = canManageMembers(org?.myRole)

  const schema = z.object({
    email: z.string().email(t('validation.invalidEmail')),
    role: z.enum(['admin', 'teacher', 'examiner', 'student']),
  })
  type Form = z.infer<typeof schema>

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'student' },
  })

  const load = async () => {
    if (!accessToken || !orgId) return
    setLoading(true)
    try {
      const [o, m] = await Promise.all([
        orgApi.getOrganizationApi(accessToken, orgId),
        orgApi.listMembersApi(accessToken, orgId),
      ])
      setOrg(o.data?.organization ?? null)
      setMembers(m.data?.members ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [accessToken, orgId])

  const onInvite = async (data: Form) => {
    if (!accessToken || !orgId) return
    setError(null)
    try {
      await orgApi.inviteMemberApi(accessToken, orgId, data)
      reset({ email: '', role: 'student' })
      toast.success(t('toast.invited'))
      await load()
    } catch (err) {
      toast.fromError(err)
      setError(t('errors.generic'))
    }
  }

  const onRoleChange = async (membershipId: string, role: Exclude<OrgMemberRole, 'owner'>) => {
    if (!accessToken || !orgId) return
    setBusyId(membershipId)
    setError(null)
    try {
      await orgApi.updateMemberRoleApi(accessToken, orgId, membershipId, role)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.generic'))
    } finally {
      setBusyId(null)
    }
  }

  const onToggleStatus = async (m: OrgMember) => {
    if (!accessToken || !orgId) return
    const next = m.status === 'suspended' ? 'active' : 'suspended'
    setBusyId(m.id)
    setError(null)
    try {
      await orgApi.setMemberStatusApi(accessToken, orgId, m.id, next)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.generic'))
    } finally {
      setBusyId(null)
    }
  }

  const onRemove = async (m: OrgMember) => {
    if (!accessToken || !orgId) return
    const ok = window.confirm(
      t('org.confirmRemove', { name: `${m.firstName} ${m.lastName}` })
    )
    if (!ok) return
    setBusyId(m.id)
    setError(null)
    try {
      await orgApi.removeMemberApi(accessToken, orgId, m.id)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.generic'))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <OrgBrandScope branding={org?.branding}>
      <div className="min-h-screen bg-mesh">
        <AppHeader
          homeTo={orgId ? `/app/organizations/${orgId}` : '/app'}
          brandTitle={org?.name}
          logoUrl={org?.branding?.logoUrl}
        />
        <Container className="py-8">
          <Link
            to={`/app/organizations/${orgId}`}
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            {t('workspace.nav.overview')}
          </Link>
          <OrgWorkspaceNav role={org?.myRole} />
          <div className="mb-6 flex items-center gap-3">
            <UserCog className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">{t('workspace.nav.members')}</h1>
          </div>
          {error && (
            <Alert variant="error" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="border-border/60 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">{t('org.members')}</CardTitle>
                  <CardDescription>{t('org.membersHint')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="divide-y divide-border">
                    {members.map((m) => {
                      const isOwner = m.role === 'owner'
                      const busy = busyId === m.id
                      return (
                        <li
                          key={m.id}
                          className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium">
                              {m.firstName} {m.lastName}
                            </p>
                            <p className="text-xs text-muted">{m.email}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {canInvite && !isOwner ? (
                              <select
                                className="h-9 rounded-lg border border-border bg-surface px-2 text-xs"
                                value={m.role}
                                disabled={busy}
                                onChange={(e) =>
                                  void onRoleChange(
                                    m.id,
                                    e.target.value as Exclude<OrgMemberRole, 'owner'>
                                  )
                                }
                              >
                                {ROLE_OPTIONS.map((r) => (
                                  <option key={r} value={r}>
                                    {r}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <Badge variant="info">{m.role}</Badge>
                            )}
                            <Badge
                              variant={
                                m.status === 'active'
                                  ? 'success'
                                  : m.status === 'suspended'
                                    ? 'error'
                                    : 'warning'
                              }
                            >
                              {m.status}
                            </Badge>
                            {canInvite && !isOwner && (
                              <>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  disabled={busy}
                                  onClick={() => void onToggleStatus(m)}
                                >
                                  {m.status === 'suspended'
                                    ? t('org.reactivate', { defaultValue: 'Reactivate' })
                                    : t('org.suspend', { defaultValue: 'Suspend' })}
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  disabled={busy}
                                  onClick={() => void onRemove(m)}
                                  className="text-destructive"
                                >
                                  {t('common.remove')}
                                </Button>
                              </>
                            )}
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </CardContent>
              </Card>
              {canInvite && (
                <Card className="h-fit border-border/60">
                  <CardHeader>
                    <CardTitle className="text-base">{t('org.inviteTitle')}</CardTitle>
                    <CardDescription>{t('org.inviteHint')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit(onInvite)} className="space-y-4" noValidate>
                      <div className="space-y-2">
                        <Label htmlFor="email">{t('auth.email')}</Label>
                        <Input id="email" type="email" {...register('email')} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">{t('org.role')}</Label>
                        <select
                          id="role"
                          className="flex h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm"
                          {...register('role')}
                        >
                          <option value="admin">{t('roles.admin')}</option>
                          <option value="teacher">{t('roles.teacher')}</option>
                          <option value="examiner">{t('roles.examiner')}</option>
                          <option value="student">{t('roles.student')}</option>
                        </select>
                      </div>
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? t('common.loading') : t('org.invite')}
                      </Button>
                    </form>
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
