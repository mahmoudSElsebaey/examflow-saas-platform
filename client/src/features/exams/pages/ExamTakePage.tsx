import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/features/auth/AuthContext'
import * as examApi from '../api/examApi'
import type { ExamAttempt, AttemptAnswer } from '../types'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Container } from '@/components/ui/Container'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/utils'

function formatRemaining(ms: number): string {
  if (ms <= 0) return '00:00'
  const totalSec = Math.floor(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function ExamTakePage() {
  const { orgId, attemptId } = useParams<{ orgId: string; attemptId: string }>()
  const { t } = useTranslation()
  const { accessToken } = useAuth()

  const [attempt, setAttempt] = useState<ExamAttempt | null>(null)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [remainingMs, setRemainingMs] = useState<number | null>(null)

  const load = useCallback(async () => {
    if (!accessToken || !orgId || !attemptId) return
    setLoading(true)
    setError(null)
    try {
      const res = await examApi.getAttemptApi(accessToken, orgId, attemptId)
      const a = res.data?.attempt ?? null
      setAttempt(a)
      if (a) {
        const map: Record<string, string[]> = {}
        for (const ans of a.answers || []) map[ans.questionId] = ans.selected
        setAnswers(map)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }, [accessToken, orgId, attemptId, t])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!attempt?.expiresAt || attempt.status !== 'in_progress') {
      setRemainingMs(null)
      return
    }
    const tick = () => {
      const ms = new Date(attempt.expiresAt!).getTime() - Date.now()
      setRemainingMs(ms)
      if (ms <= 0) void load()
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [attempt?.expiresAt, attempt?.status, load])

  const questions = attempt?.questions ?? []
  const q = questions[current]

  const answeredCount = useMemo(() => {
    return questions.filter((qq) => (answers[qq.id]?.length ?? 0) > 0).length
  }, [questions, answers])

  const selectSingle = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: [optionId] }))
  }

  const toggleMulti = (questionId: string, optionId: string) => {
    setAnswers((prev) => {
      const cur = prev[questionId] ?? []
      const next = cur.includes(optionId)
        ? cur.filter((x) => x !== optionId)
        : [...cur, optionId]
      return { ...prev, [questionId]: next }
    })
  }

  const buildPayload = (): AttemptAnswer[] =>
    Object.entries(answers).map(([questionId, selected]) => ({
      questionId,
      selected,
    }))

  const onSave = async () => {
    if (!accessToken || !orgId || !attemptId) return
    try {
      await examApi.saveAnswersApi(accessToken, orgId, attemptId, buildPayload())
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.generic'))
    }
  }

  const onSubmit = async () => {
    if (!accessToken || !orgId || !attemptId) return
    if (!window.confirm(t('exam.confirmSubmit'))) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await examApi.submitAttemptApi(
        accessToken,
        orgId,
        attemptId,
        buildPayload()
      )
      setAttempt(res.data?.attempt ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.generic'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner />
      </div>
    )
  }

  if (!attempt) {
    return (
      <div className="min-h-screen bg-background p-8">
        <Container>
          <Alert variant="error">
            <AlertDescription>{error || t('exam.attemptNotFound')}</AlertDescription>
          </Alert>
        </Container>
      </div>
    )
  }

  const isDone = attempt.status === 'submitted' || attempt.status === 'timed_out'

  if (isDone) {
    return (
      <div className="min-h-screen bg-background">
        <Container className="py-16">
          <Card className="mx-auto max-w-lg border-border/60">
            <CardContent className="space-y-4 pt-8 text-center">
              <h1 className="text-2xl font-bold text-foreground">
                {attempt.examTitle || t('exam.resultTitle')}
              </h1>
              <p className="text-muted">
                {attempt.status === 'timed_out' ? t('exam.timedOut') : t('exam.submitted')}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Badge variant={attempt.passed ? 'success' : 'error'}>
                  {attempt.passed ? t('exam.passed') : t('exam.failed')}
                </Badge>
                <Badge variant="info">
                  {attempt.score}/{attempt.maxScore} ({attempt.percent}%)
                </Badge>
              </div>
              <Link to={`/app/organizations/${orgId}/exams`}>
                <Button variant="outline" className="mt-4">
                  {t('exam.backToExams')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </Container>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-surface">
        <Container>
          <div className="flex h-14 items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {attempt.examTitle}
              </p>
              <p className="text-xs text-muted">
                {answeredCount}/{questions.length} {t('exam.answered')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {remainingMs != null && (
                <span
                  className={cn(
                    'rounded-lg px-3 py-1 font-mono text-sm font-semibold tabular-nums',
                    remainingMs < 60_000
                      ? 'bg-error-muted text-error'
                      : 'bg-surface-subtle text-foreground'
                  )}
                >
                  {formatRemaining(remainingMs)}
                </span>
              )}
              <Button size="sm" variant="outline" onClick={() => void onSave()}>
                {t('exam.save')}
              </Button>
              <Button size="sm" onClick={() => void onSubmit()} disabled={submitting}>
                {submitting ? t('common.loading') : t('exam.submit')}
              </Button>
            </div>
          </div>
        </Container>
      </header>

      <Container className="py-8">
        {error && (
          <Alert variant="error" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mb-6 flex flex-wrap gap-2">
          {questions.map((qq, i) => (
            <button
              key={qq.id}
              type="button"
              onClick={() => setCurrent(i)}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition-colors',
                i === current
                  ? 'bg-primary text-primary-foreground'
                  : (answers[qq.id]?.length ?? 0) > 0
                    ? 'bg-primary-muted text-primary'
                    : 'bg-surface-subtle text-muted hover:text-foreground'
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {q && (
          <Card className="border-border/60 shadow-sm">
            <CardContent className="space-y-6 pt-8">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="info">
                  {current + 1}/{questions.length}
                </Badge>
                <Badge variant="warning">{q.difficulty}</Badge>
                <Badge variant="success">
                  {q.points} {t('exam.pts')}
                </Badge>
              </div>

              <p className="text-lg font-medium leading-relaxed text-foreground">{q.stem}</p>

              <div className="space-y-2">
                {q.options.map((opt) => {
                  const selected = answers[q.id]?.includes(opt.id) ?? false
                  const multi = q.type === 'mcq_multiple'
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() =>
                        multi ? toggleMulti(q.id, opt.id) : selectSingle(q.id, opt.id)
                      }
                      className={cn(
                        'flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-start text-sm transition-colors',
                        selected
                          ? 'border-primary bg-primary-muted text-foreground'
                          : 'border-border bg-surface hover:border-primary/40'
                      )}
                    >
                      <span
                        className={cn(
                          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs',
                          selected
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border'
                        )}
                      >
                        {selected ? '✓' : ''}
                      </span>
                      {opt.text}
                    </button>
                  )
                })}
                {q.type === 'short_answer' && (
                  <p className="text-sm text-muted">{t('exam.shortAnswerHint')}</p>
                )}
              </div>

              <div className="flex justify-between gap-3 border-t border-border pt-4">
                <Button
                  variant="outline"
                  disabled={current === 0}
                  onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                >
                  {t('common.back')}
                </Button>
                <Button
                  disabled={current >= questions.length - 1}
                  onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}
                >
                  {t('common.next')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </Container>
    </div>
  )
}
