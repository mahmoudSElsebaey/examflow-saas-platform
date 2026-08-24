import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/features/auth/AuthContext'
import * as examApi from '../api/examApi'
import type { ExamAttempt, GradingQueueItem } from '../types'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Container } from '@/components/ui/Container'
import { Spinner } from '@/components/ui/Spinner'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { OrgWorkspaceNav } from '@/components/layout/OrgWorkspaceNav'
import { AppHeader } from '@/components/layout/AppHeader'

export function OrgGradingPage() {
  const { orgId, attemptId } = useParams<{ orgId: string; attemptId?: string }>()
  const { t } = useTranslation()
  const toast = useToast()
  const { accessToken } = useAuth()
  const [items, setItems] = useState<GradingQueueItem[]>([])
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [scores, setScores] = useState<Record<string, string>>({})
  const [feedback, setFeedback] = useState<Record<string, string>>({})

  const loadQueue = useCallback(async () => {
    if (!accessToken || !orgId) return
    setLoading(true)
    setError(null)
    try {
      const res = await examApi.listGradingQueueApi(accessToken, orgId)
      setItems(res.data?.items ?? [])
    } catch (err) {
      toast.fromError(err); setError(t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }, [accessToken, orgId, t])

  const loadAttempt = useCallback(async () => {
    if (!accessToken || !orgId || !attemptId) return
    setLoading(true)
    setError(null)
    try {
      const res = await examApi.getAttemptForGradingApi(accessToken, orgId, attemptId)
      const a = res.data?.attempt ?? null
      setAttempt(a)
      if (a?.questions) {
        const s: Record<string, string> = {}
        const f: Record<string, string> = {}
        for (const q of a.questions) {
          if (q.type !== 'short_answer') continue
          const ans = a.answers?.find((x) => x.questionId === q.id)
          if (ans?.manualScore != null) s[q.id] = String(ans.manualScore)
          if (ans?.feedback) f[q.id] = ans.feedback
        }
        setScores(s)
        setFeedback(f)
      }
    } catch (err) {
      toast.fromError(err); setError(t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }, [accessToken, orgId, attemptId, t])

  useEffect(() => {
    if (attemptId) void loadAttempt()
    else void loadQueue()
  }, [attemptId, loadAttempt, loadQueue])

  const saveGrades = async () => {
    if (!accessToken || !orgId || !attemptId || !attempt) return
    const shortQs = (attempt.questions || []).filter((q) => q.type === 'short_answer')
    const grades = shortQs
      .filter((q) => scores[q.id] !== undefined && scores[q.id] !== '')
      .map((q) => ({
        questionId: q.id,
        points: Number(scores[q.id]),
        feedback: feedback[q.id] || null,
      }))
    if (grades.length === 0) {
      setError(t('grading.enterAtLeastOne'))
      return
    }
    for (const g of grades) {
      const q = shortQs.find((x) => x.id === g.questionId)
      if (!q || Number.isNaN(g.points) || g.points < 0 || g.points > q.points) {
        setError(t('grading.invalidPoints'))
        return
      }
    }
    setSaving(true)
    setError(null)
    try {
      const res = await examApi.applyManualGradesApi(accessToken, orgId, attemptId, grades)
      setAttempt(res.data?.attempt ?? null)
    } catch (err) {
      toast.fromError(err); setError(t('errors.generic'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <Container className="py-6 sm:py-8">
        <OrgWorkspaceNav />
        <div className="mb-6 mt-4">
          <h1 className="text-2xl font-bold text-foreground">{t('grading.title')}</h1>
          <p className="text-sm text-muted">{t('grading.subtitle')}</p>
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
        ) : attemptId && attempt ? (
          <div className="space-y-4">
            <Card>
              <CardContent className="space-y-2 pt-6">
                <p className="text-lg font-semibold">{attempt.examTitle}</p>
                <p className="text-sm text-muted">
                  {t('grading.student')}: {attempt.studentName || attempt.userId}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="info">
                    {attempt.score}/{attempt.maxScore} ({attempt.percent}%)
                  </Badge>
                  {attempt.needsManualGrading ? (
                    <Badge variant="warning">{t('grading.pending')}</Badge>
                  ) : (
                    <Badge variant="success">{t('grading.complete')}</Badge>
                  )}
                </div>
                <Link to={`/app/organizations/${orgId}/grading`}>
                  <Button variant="outline" size="sm" className="mt-2">
                    {t('grading.backQueue')}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {(attempt.questions || [])
              .filter((q) => q.type === 'short_answer')
              .map((q, i) => (
                <Card key={q.id}>
                  <CardContent className="space-y-3 pt-6">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="info">#{i + 1}</Badge>
                      <Badge variant="warning">
                        {q.points} {t('exam.pts')}
                      </Badge>
                      {q.outcome === 'pending_manual' && (
                        <Badge variant="warning">{t('exam.pendingReview')}</Badge>
                      )}
                    </div>
                    <p className="font-medium text-foreground">{q.stem}</p>
                    <div className="rounded-lg bg-surface-subtle p-3 text-sm">
                      <p className="text-xs text-muted">{t('exam.yourAnswer')}</p>
                      <p className="mt-1 whitespace-pre-wrap text-foreground">
                        {(q.userSelected?.[0] || '—').slice(0, 5000)}
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label htmlFor={`pts-${q.id}`}>
                          {t('grading.points')} (0–{q.points})
                        </Label>
                        <Input
                          id={`pts-${q.id}`}
                          type="number"
                          min={0}
                          max={q.points}
                          step={0.5}
                          value={scores[q.id] ?? ''}
                          onChange={(e) =>
                            setScores((prev) => ({ ...prev, [q.id]: e.target.value }))
                          }
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <Label htmlFor={`fb-${q.id}`}>{t('grading.feedback')}</Label>
                        <textarea
                          id={`fb-${q.id}`}
                          rows={2}
                          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
                          value={feedback[q.id] ?? ''}
                          onChange={(e) =>
                            setFeedback((prev) => ({ ...prev, [q.id]: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

            <Button onClick={() => void saveGrades()} disabled={saving}>
              {saving ? t('common.loading') : t('grading.save')}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted">
                  {t('grading.empty')}
                </CardContent>
              </Card>
            ) : (
              items.map((item) => (
                <Card key={item.id}>
                  <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{item.examTitle}</p>
                      <p className="text-sm text-muted">
                        {item.studentName} · {item.pendingManualCount}{' '}
                        {t('grading.pendingItems')}
                      </p>
                      {item.submittedAt && (
                        <p className="text-xs text-muted">
                          {new Date(item.submittedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <Link to={`/app/organizations/${orgId}/grading/${item.id}`}>
                      <Button size="sm">{t('grading.review')}</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </Container>
    </div>
  )
}
