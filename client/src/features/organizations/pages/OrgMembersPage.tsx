import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, UserCog } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import * as orgApi from '../api/orgApi'
import type { OrgMember, Organization } from '../types'
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'

export function OrgMembersPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const { t } = useTranslation()
  const { accessToken } = useAuth()
  const [org, setOrg] = useState<Organization | null>(null)
  const [members, setMembers] = useState<OrgMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
    try {
      await orgApi.inviteMemberApi(accessToken, orgId, data)
      reset({ email: '', role: 'student' })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.generic'))
    }
  }

  return (
    <div className="min-h-screen bg-mesh">
      <AppHeader homeTo={orgId ? `/app/organizations/${orgId}` : '/app'} brandTitle={org?.name} logoUrl={org?.branding?.logoUrl} />
      <Container className="py-8">
        <Link to={`/app/organizations/${orgId}`} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
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
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="border-border/60 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">{t('org.members')}</CardTitle>
                <CardDescription>{t('org.membersHint')}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-border">
                  {members.map((m) => (
                    <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                      <div>
                        <p className="text-sm font-medium">{m.firstName} {m.lastName}</p>
                        <p className="text-xs text-muted">{m.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="info">{m.role}</Badge>
                        <Badge variant={m.status === 'active' ? 'success' : 'warning'}>{m.status}</Badge>
                      </div>
                    </li>
                  ))}
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
                      <select id="role" className="flex h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm" {...register('role')}>
                        <option value="admin">admin</option>
                        <option value="teacher">teacher</option>
                        <option value="examiner">examiner</option>
                        <option value="student">student</option>
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
  )
}
