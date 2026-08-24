import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/components/ui/Toast'
import { useAuth } from '@/features/auth/AuthContext'
import * as examApi from '../api/examApi'
import type { ExamAttempt, AttemptAnswer } from '../types'
import { useExamSecurity } from '../hooks/useExamSecurity'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Container } from '@/components/ui/Container'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/utils'
import { ExamResultView } from './ExamResultView'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

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
  const toast = useToast()
  const { accessToken } = useAuth()

  const [attempt, setAttempt] = useState<ExamAttempt | null>(null)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [remainingMs, setRemainingMs] = useState<number | null>(null)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')

  const answersRef = useRef(answers)
  answersRef.current = answers
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const skipNextAutosaveRef = useRef(true)
  const inProgressRef = useRef(true)

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
        for (const ans of a.answers || []) map[ans.questionId] = ans.selected ?? []
        setAnswers(map)
        skipNextAutosaveRef.current = true
        inProgressRef.current = a.status === 'in_progress'
      }
    } catch (err) {
      toast.fromError(err); setError(t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }, [accessToken, orgId, attemptId, t])

  useEffect(() => {
    void load()
  }, [load])

  useExamSecurity({
    accessToken,
    orgId,
    attemptId,
    enabled: !!attempt && attempt.status === 'in_progress',
    trackTabSwitch: true,
    trackPaste: true,
    warnOnLeave: true,
  })

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

  const buildPayload = useCallback((): AttemptAnswer[] => {
    return Object.entries(answersRef.current).map(([questionId, selected]) => ({
      questionId,
      selected,
    }))
  }, [])

  const persistAnswers = useCallback(async () => {
    if (!accessToken || !orgId || !attemptId) return
    if (!inProgressRef.current) return
    setSaveStatus('saving')
    try {
      await examApi.saveAnswersApi(accessToken, orgId, attemptId, buildPayload())
      setSaveStatus('saved')
    } catch (err) {
      setSaveStatus('error')
      toast.fromError(err); setError(t('errors.generic'))
    }
  }, [accessToken, orgId, attemptId, buildPayload, t])

  useEffect(() => {
    if (skipNextAutosaveRef.current) {
      skipNextAutosaveRef.current = false
      return
    }
    if (!attempt || attempt.status !== 'in_progress') return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      void persistAnswers()
    }, 700)
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [answers, attempt, persistAnswers])

  useEffect(() => {
    const onLeave = () => {
      if (!accessToken || !orgId || !attemptId || !inProgressRef.current) return
      const body = JSON.stringify({ answers: buildPayload() })
      const url = `${import.meta.env.VITE_API_URL || '/api/v1'}/organizations/${orgId}/attempts/${attemptId}/answers`
      try {
        void fetch(url, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body,
          credentials: 'include',
          keepalive: true,
        })
      } catch {
        /* ignore */
      }
    }
    window.addEventListener('pagehide', onLeave)
    return () => window.removeEventListener('pagehide', onLeave)
  }, [accessToken, orgId, attemptId, buildPayload])

  const questions = attempt?.questions ?? []
  const q = questions[current]

  const answeredCount = useMemo(() => {
    return questions.filter((qq) => {
      const sel = answers[qq.id] ?? []
      if (qq.type === 'short_answer') return (sel[0] ?? '').trim().length > 0
      return sel.length > 0
    }).length
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

  const setShortAnswer = (questionId: string, text: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: text.length ? [text] : [],
    }))
  }

  const goTo = (index: number) => {
    setCurrent(index)
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
    }
    void persistAnswers()
  }

  const onSubmit = async () => {
    if (!accessToken || !orgId || !attemptId) return
    if (!window.confirm(t('exam.confirmSubmit'))) return
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
      saveTimerRef.current = null
    }
    setSubmitting(true)
    setError(null)
    try {
      const res = await examApi.submitAttemptApi(
        accessToken,
        orgId,
        attemptId,
        buildPayload()
      )
      inProgressRef.current = false
      setAttempt(res.data?.attempt ?? null)
    } catch (err) {
      toast.fromError(err); setError(t('errors.generic'))
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
      <ExamResultView
        attempt={attempt}
        orgId={orgId!}
        accessToken={accessToken}
        onIssued={(id, code) =>
          setAttempt((prev) =>
            prev ? { ...prev, certificateId: id, certificateCode: code } : prev
          )
        }
      />
    )
  }

  const saveLabel =
    saveStatus === 'saving'
      ? t('exam.saving')
      : saveStatus === 'saved'
        ? t('exam.saved')
        : saveStatus === 'error'
          ? t('exam.saveFailed')
          : t('exam.save')

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/95 backdrop-blur">
        <Container>
          <div className="flex h-14 items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {attempt.examTitle}
              </p>
              <p className="text-xs text-muted">
                {answeredCount}/{questions.length} {t('exam.answered')}
                {saveStatus !== 'idle' && (
                  <span
                    className={cn(
                      'ms-2',
                      saveStatus === 'saved' && 'text-success',
                      saveStatus === 'error' && 'text-error',
                      saveStatus === 'saving' && 'text-muted'
                    )}
                  >
                    · {saveLabel}
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {remainingMs != null && (
                <span
                  className={cn(
                    'rounded-lg px-2.5 py-1 font-mono text-sm tabular-nums',
                    remainingMs < 60_000
                      ? 'bg-error/15 text-error'
                      : 'bg-surface-subtle text-foreground'
                  )}
                >
                  {formatRemaining(remainingMs)}
                </span>
              )}
              <Button
                size="sm"
                variant="outline"
                className="hidden sm:inline-flex"
                onClick={() => void persistAnswers()}
                disabled={saveStatus === 'saving'}
              >
                {saveLabel}
              </Button>
              <Button size="sm" onClick={() => void onSubmit()} disabled={submitting}>
                {submitting ? t('common.loading') : t('exam.submit')}
              </Button>
            </div>
          </div>
        </Container>
      </header>

      <Container className="py-6 sm:py-10">
        {error && (
          <Alert variant="error" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mb-4 flex flex-wrap gap-1.5">
          {questions.map((qq, i) => {
            const sel = answers[qq.id] ?? []
            const has =
              qq.type === 'short_answer'
                ? (sel[0] ?? '').trim().length > 0
                : sel.length > 0
            return (
              <button
                key={qq.id}
                type="button"
                onClick={() => goTo(i)}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-md text-xs font-medium',
                  i === current
                    ? 'bg-primary text-primary-foreground'
                    : has
                      ? 'bg-primary-muted text-primary'
                      : 'bg-surface-subtle text-muted'
                )}
              >
                {i + 1}
              </button>
            )
          })}
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
                {q.type === 'short_answer' && (
                  <Badge variant="info">{t('exam.shortAnswerBadge')}</Badge>
                )}
              </div>

              <p className="text-lg font-medium leading-relaxed text-foreground">{q.stem}</p>

              <div className="space-y-2">
                {q.type === 'short_answer' ? (
                  <div className="space-y-2">
                    <label htmlFor={`sa-${q.id}`} className="text-sm font-medium text-muted">
                      {t('exam.yourAnswer')}
                    </label>
                    <textarea
                      id={`sa-${q.id}`}
                      rows={5}
                      className="w-full resize-y rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder={t('exam.shortAnswerPlaceholder')}
                      value={answers[q.id]?.[0] ?? ''}
                      onChange={(e) => setShortAnswer(q.id, e.target.value)}
                      maxLength={5000}
                    />
                    <p className="text-xs text-muted">{t('exam.shortAnswerHint')}</p>
                  </div>
                ) : (
                  (q.options || []).map((opt) => {
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
                            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border text-xs',
                            multi ? 'rounded-md' : 'rounded-full',
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
                  })
                )}
              </div>

              <div className="flex justify-between gap-3 border-t border-border pt-4">
                <Button
                  variant="outline"
                  disabled={current === 0}
                  onClick={() => goTo(Math.max(0, current - 1))}
                >
                  {t('common.back')}
                </Button>
                <Button
                  disabled={current >= questions.length - 1}
                  onClick={() => goTo(Math.min(questions.length - 1, current + 1))}
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
