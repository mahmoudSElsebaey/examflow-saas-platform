import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/features/auth/AuthContext'
import { getStudentHistoryApi, type StudentHistory } from '../api/analyticsApi'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Spinner } from '@/components/ui/Spinner'
import { OrgWorkspaceLayout } from '@/components/layout/OrgWorkspaceLayout'

export function StudentProgressPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const { t } = useTranslation()
  const { accessToken } = useAuth()
  const [data, setData] = useState<StudentHistory | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!accessToken || !orgId) return
    void (async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await getStudentHistoryApi(accessToken, orgId)
        setData(res.data?.analytics ?? null)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : t('errors.generic'))
      } finally {
        setLoading(false)
      }
    })()
  }, [accessToken, orgId, t])

  if (!orgId) return null

  return (
    <OrgWorkspaceLayout orgId={orgId}>
      <div>
        <h1 className="mb-1 text-2xl font-bold tracking-tight">{t('progress.myProgress')}</h1>
        <p className="mb-6 text-muted">{t('progress.myProgressHint')}</p>

        {error && (
          <Alert variant="error" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading || !data ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="py-4">
                  <p className="text-xs text-muted">{t('progress.attempts')}</p>
                  <p className="text-2xl font-bold">{data.attemptsCount}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4">
                  <p className="text-xs text-muted">{t('progress.avgScore')}</p>
                  <p className="text-2xl font-bold">
                    {data.averagePercent != null ? `${data.averagePercent}%` : '—'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4">
                  <p className="text-xs text-muted">{t('progress.lessonsCompleted')}</p>
                  <p className="text-2xl font-bold">{data.lessonsCompleted}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4">
                  <p className="text-xs text-muted">{t('progress.lessonsViewed')}</p>
                  <p className="text-2xl font-bold">{data.lessonsViewed}</p>
                </CardContent>
              </Card>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-semibold">{t('progress.examHistory')}</h2>
              {data.attempts.length === 0 ? (
                <p className="text-sm text-muted">{t('progress.noAttempts')}</p>
              ) : (
                <ul className="space-y-2">
                  {data.attempts.map((a) => (
                    <li
                      key={a.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 py-2"
                    >
                      <div>
                        <p className="font-medium">{a.examTitle}</p>
                        <p className="text-xs text-muted">{a.status}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {a.percent != null && (
                          <span className="text-sm font-semibold">{a.percent}%</span>
                        )}
                        {a.passed === true && <Badge variant="success">{t('exam.passed')}</Badge>}
                        {a.passed === false && <Badge variant="error">{t('exam.failed')}</Badge>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h2 className="mb-3 text-lg font-semibold">{t('progress.lessonHistory')}</h2>
              {data.recentLessons.length === 0 ? (
                <p className="text-sm text-muted">{t('progress.noLessons')}</p>
              ) : (
                <ul className="space-y-2">
                  {data.recentLessons.map((l) => (
                    <li
                      key={l.lessonId + l.viewedAt}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 py-2"
                    >
                      <p className="font-medium">{l.lessonTitle}</p>
                      <Badge variant={l.status === 'completed' ? 'success' : 'secondary'}>
                        {l.status === 'completed'
                          ? t('progress.completed')
                          : t('progress.viewed')}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </OrgWorkspaceLayout>
  )
}
