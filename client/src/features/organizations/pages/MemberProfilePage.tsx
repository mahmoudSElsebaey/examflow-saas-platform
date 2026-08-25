import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Award, BookOpen, ClipboardList, User } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import * as orgApi from '../api/orgApi'
import type { MemberProfile } from '../api/orgApi'
import type { Organization } from '../types'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Spinner } from '@/components/ui/Spinner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { OrgWorkspaceLayout } from '@/components/layout/OrgWorkspaceLayout'

export function MemberProfilePage() {
  const { orgId, userId } = useParams<{ orgId: string; userId: string }>()
  const { t, i18n } = useTranslation()
  const ar = i18n.language?.startsWith('ar')
  const { accessToken, user } = useAuth()
  const [org, setOrg] = useState<Organization | null>(null)
  const [profile, setProfile] = useState<MemberProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!accessToken || !orgId || !userId) return
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const [orgRes, res] = await Promise.all([
          orgApi.getOrganizationApi(accessToken, orgId),
          orgApi.getMemberProfileApi(accessToken, orgId, userId),
        ])
        setOrg(orgRes.data?.organization ?? null)
        setProfile(res.data?.profile ?? null)
      } catch (err) {
        setError(err instanceof Error ? err.message : t('errors.generic'))
      } finally {
        setLoading(false)
      }
    })()
  }, [accessToken, orgId, userId, t])

  if (!orgId) return null

  const isSelf = user?.id === userId

  return (
    <OrgWorkspaceLayout
      orgId={orgId}
      orgName={org?.name}
      role={org?.myRole}
      branding={org?.branding}
    >
      <div className="mb-4">
        <Link
          to={`/app/organizations/${orgId}/members`}
          className="text-sm font-medium text-muted hover:text-foreground"
        >
          ← {t('workspace.nav.members')}
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : error ? (
        <Alert variant="error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : profile ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-muted text-primary">
                <User className="h-7 w-7" />
              </span>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="text-sm text-muted">
                  {isSelf
                    ? ar
                      ? 'ملفك داخل المؤسسة (مهام ودرجات)'
                      : 'Your org profile (tasks & grades)'
                    : ar
                      ? 'ملف العضو — للأونر/الأدمن أو صاحب الحساب'
                      : 'Member profile — owner/admin or self only'}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="info">{profile.role}</Badge>
                  <Badge variant={profile.status === 'active' ? 'success' : 'warning'}>
                    {profile.status}
                  </Badge>
                </div>
                {profile.email && (
                  <p className="mt-1 text-xs text-muted">{profile.email}</p>
                )}
              </div>
            </div>
            <Link to={`/app/organizations/${orgId}`}>
              <Button variant="outline" size="sm">
                {t('workspace.nav.overview')}
              </Button>
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: ar ? 'محاولات' : 'Attempts',
                value: profile.stats.attemptsCount,
              },
              {
                label: ar ? 'مكتملة' : 'Completed',
                value: profile.stats.completedCount,
              },
              {
                label: ar ? 'متوسط الدرجة' : 'Avg score',
                value:
                  profile.stats.averagePercent != null
                    ? `${profile.stats.averagePercent}%`
                    : '—',
              },
              {
                label: ar ? 'نسبة النجاح' : 'Pass rate',
                value:
                  profile.stats.passRate != null ? `${profile.stats.passRate}%` : '—',
              },
            ].map((s) => (
              <Card key={s.label} className="border-border/60">
                <CardContent className="pt-5">
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Card className="border-border/60">
              <CardContent className="pt-5">
                <p className="text-xl font-bold">{profile.stats.lessonsViewed}</p>
                <p className="text-xs text-muted">{ar ? 'دروس شوهدت' : 'Lessons viewed'}</p>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="pt-5">
                <p className="text-xl font-bold">{profile.stats.lessonsCompleted}</p>
                <p className="text-xs text-muted">{ar ? 'دروس مكتملة' : 'Lessons completed'}</p>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="pt-5">
                <p className="text-xl font-bold">{profile.stats.certificatesCount}</p>
                <p className="text-xs text-muted">{ar ? 'شهادات' : 'Certificates'}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ClipboardList className="h-4 w-4 text-primary" />
                  {ar ? 'الامتحانات والدرجات' : 'Exams & grades'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!profile.recentAttempts.length ? (
                  <p className="text-sm text-muted">{ar ? 'لا محاولات بعد' : 'No attempts yet'}</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {profile.recentAttempts.map((a) => (
                      <li
                        key={a.id}
                        className="flex flex-wrap items-center justify-between gap-2 py-2.5"
                      >
                        <div>
                          <p className="text-sm font-medium">{a.examTitle}</p>
                          <p className="text-xs text-muted">{a.status}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {a.percent != null && <Badge variant="info">{a.percent}%</Badge>}
                          {a.passed != null && (
                            <Badge variant={a.passed ? 'success' : 'error'}>
                              {a.passed ? t('exam.passed') : t('exam.failed')}
                            </Badge>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="h-4 w-4 text-primary" />
                  {ar ? 'تقدّم الدروس' : 'Lesson progress'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!profile.recentLessons.length ? (
                  <p className="text-sm text-muted">{ar ? 'لا دروس بعد' : 'No lessons yet'}</p>
                ) : (
                  <ul className="divide-y divide-border">
                    {profile.recentLessons.map((l) => (
                      <li key={l.lessonId} className="flex justify-between gap-2 py-2.5">
                        <p className="text-sm font-medium">{l.lessonTitle}</p>
                        <Badge variant={l.status === 'completed' ? 'success' : 'info'}>
                          {l.status}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Award className="h-4 w-4 text-primary" />
                {t('cert.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!profile.certificates.length ? (
                <p className="text-sm text-muted">{t('cert.empty')}</p>
              ) : (
                <ul className="divide-y divide-border">
                  {profile.certificates.map((c) => (
                    <li
                      key={c.id}
                      className="flex flex-wrap items-center justify-between gap-2 py-2.5"
                    >
                      <div>
                        <p className="text-sm font-medium">{c.examTitle}</p>
                        <p className="text-xs text-muted">{c.code}</p>
                      </div>
                      <Badge variant="success">{c.percent}%</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </OrgWorkspaceLayout>
  )
}
