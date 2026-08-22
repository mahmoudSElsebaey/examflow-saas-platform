import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Users } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import * as orgApi from '../api/orgApi'
import type { OrgMember } from '../types'
import { Badge } from '@/components/ui/Badge'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Container } from '@/components/ui/Container'
import { Spinner } from '@/components/ui/Spinner'
import { AppHeader } from '@/components/layout/AppHeader'
import { OrgWorkspaceNav } from '@/components/layout/OrgWorkspaceNav'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'

export function OrgStudentsPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const { t } = useTranslation()
  const { accessToken } = useAuth()
  const [students, setStudents] = useState<OrgMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!accessToken || !orgId) return
    ;(async () => {
      setLoading(true)
      try {
        const res = await orgApi.listMembersApi(accessToken, orgId)
        const all = res.data?.members ?? []
        setStudents(all.filter((m) => m.role === 'student'))
      } catch (err) {
        setError(err instanceof Error ? err.message : t('errors.generic'))
      } finally {
        setLoading(false)
      }
    })()
  }, [accessToken, orgId, t])

  return (
    <div className="min-h-screen bg-mesh">
      <AppHeader homeTo={orgId ? `/app/organizations/${orgId}` : '/app'} />
      <Container className="py-8">
        <Link
          to={`/app/organizations/${orgId}`}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t('workspace.nav.overview')}
        </Link>
        <OrgWorkspaceNav />
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
                        <p className="text-sm font-medium">
                          {m.firstName} {m.lastName}
                        </p>
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
      </Container>
    </div>
  )
}
