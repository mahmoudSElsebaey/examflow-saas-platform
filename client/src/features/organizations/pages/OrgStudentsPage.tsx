import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Users } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import * as orgApi from '../api/orgApi'
import type { OrgMember, Organization } from '../types'
import { Badge } from '@/components/ui/Badge'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Spinner } from '@/components/ui/Spinner'
import { OrgWorkspaceLayout } from '@/components/layout/OrgWorkspaceLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'

export function OrgStudentsPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const { t } = useTranslation()
  const { accessToken } = useAuth()
  const [org, setOrg] = useState<Organization | null>(null)
  const [students, setStudents] = useState<OrgMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!accessToken || !orgId) return
    ;(async () => {
      setLoading(true)
      try {
        const [o, res] = await Promise.all([
          orgApi.getOrganizationApi(accessToken, orgId),
          orgApi.listMembersApi(accessToken, orgId),
        ])
        setOrg(o.data?.organization ?? null)
        const all = res.data?.members ?? []
        setStudents(all.filter((m) => m.role === 'student'))
      } catch (err) {
        setError(err instanceof Error ? err.message : t('errors.generic'))
      } finally {
        setLoading(false)
      }
    })()
  }, [accessToken, orgId, t])

  if (!orgId) return null

  return (
    <OrgWorkspaceLayout
      orgId={orgId}
      orgName={org?.name}
      role={org?.myRole}
      branding={org?.branding}
    >
      <div className="mb-6 flex items-center gap-3">
        <Users className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('workspace.studentsTitle')}</h1>
          <p className="text-sm text-muted">{t('workspace.studentsHint')}</p>
        </div>
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
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">
              {t('workspace.studentsCount', { count: students.length })}
            </CardTitle>
            <CardDescription>{t('workspace.studentsFromMembers')}</CardDescription>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <p className="text-sm text-muted">{t('workspace.noStudents')}</p>
            ) : (
              <ul className="divide-y divide-border">
                {students.map((m) => (
                  <li
                    key={m.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-3"
                  >
                    <div>
                      <Link
                        to={`/app/organizations/${orgId}/members/${m.userId}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {m.firstName} {m.lastName}
                      </Link>
                      <p className="text-xs text-muted">{m.email}</p>
                    </div>
                    <Badge variant={m.status === 'active' ? 'success' : 'warning'}>
                      {m.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </OrgWorkspaceLayout>
  )
}
