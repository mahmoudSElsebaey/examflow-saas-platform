import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Users } from 'lucide-react'
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

export function OrganizationDetailPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const { t } = useTranslation()
  const { accessToken } = useAuth()
  const [org, setOrg] = useState<Organization | null>(null)
  const [members, setMembers] = useState<OrgMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const canManage = org?.myRole === 'owner' || org?.myRole === 'admin'

  const inviteSchema = z.object({
    email: z.string().email(t('validation.invalidEmail')),
    role: z.enum(['admin', 'teacher', 'examiner', 'student']),
  })
  type InviteForm = z.infer<typeof inviteSchema>

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: 'teacher' },
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
      setOrg(orgRes.data?.organization ?? null)
      setMembers(membersRes.data?.members ?? [])
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
      reset({ email: '', role: 'teacher' })
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.generic'))
    }
  }

  return (
    <div className="min-h-screen bg-mesh">
      <AppHeader />

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
                          <Badge variant={m.status === 'active' ? 'success' : 'warning'}>
                            {m.status}
                          </Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {canManage && (
                <Card className="h-fit border-border/60">
                  <CardHeader>
                    <CardTitle className="text-base">{t('org.inviteTitle')}</CardTitle>
                    <CardDescription>{t('org.inviteHint')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={handleSubmit(onInvite)}
                      className="space-y-4"
                      noValidate
                    >
                      <div className="space-y-2">
                        <Label htmlFor="email">{t('auth.email')}</Label>
                        <Input
                          id="email"
                          type="email"
                          error={!!errors.email}
                          {...register('email')}
                        />
                        {errors.email && (
                          <p className="text-xs text-error">{errors.email.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">{t('org.role')}</Label>
                        <select
                          id="role"
                          className="flex h-11 w-full rounded-lg border border-border bg-surface px-3.5 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          {...register('role')}
                        >
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
          </>
        ) : (
          <Alert variant="error">
            <AlertDescription>{t('org.notFound')}</AlertDescription>
          </Alert>
        )}
      </Container>
    </div>
  )
}
