import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { ExamAttempt } from '../types'
import * as certApi from '@/features/certificates/api/certificateApi'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Container } from '@/components/ui/Container'
import { cn } from '@/lib/utils'

function formatDuration(sec: number | null | undefined): string {
  if (sec == null) return '—'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function ExamResultView({
  attempt,
  orgId,
  accessToken,
  onIssued,
}: {
  attempt: ExamAttempt
  orgId: string
  accessToken: string | null
  onIssued: (id: string, code: string) => void
}) {
  const { t } = useTranslation()
  const [issuing, setIssuing] = useState(false)
  const [issueError, setIssueError] = useState<string | null>(null)
  const [showReview, setShowReview] = useState(true)
  const review = attempt.review
  const locked =
    !!attempt.resultsLockedUntil && new Date(attempt.resultsLockedUntil) > new Date()

  const issueCert = async () => {
    if (!accessToken) return
    setIssuing(true)
    setIssueError(null)
    try {
      const res = await certApi.issueCertificateApi(accessToken, orgId, attempt.id)
      const c = res.data?.certificate
      if (c) onIssued(c.id, c.code)
    } catch (err) {
      setIssueError(err instanceof Error ? err.message : t('errors.generic'))
    } finally {
      setIssuing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Container className="py-8 sm:py-12">
        <Card className="mx-auto max-w-2xl border-border/60">
          <CardContent className="space-y-6 pt-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                {attempt.examTitle || t('exam.resultTitle')}
              </h1>
              <p className="mt-1 text-muted">
                {attempt.status === 'timed_out' ? t('exam.timedOut') : t('exam.submitted')}
              </p>
            </div>

            {locked ? (
              <Alert variant="info">
                <AlertDescription>
                  {t('exam.resultsLocked', {
                    defaultValue:
                      'Detailed results will be available after the release delay set by your instructor.',
                  })}
                  {attempt.resultsLockedUntil && (
                    <span className="ms-1 text-xs">
                      ({new Date(attempt.resultsLockedUntil).toLocaleString()})
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge
                    variant={attempt.passed ? 'success' : 'error'}
                    className="px-3 py-1 text-sm"
                  >
                    {attempt.passed ? t('exam.passed') : t('exam.failed')}
                  </Badge>
                  <Badge variant="info" className="px-3 py-1 text-sm">
                    {attempt.score}/{attempt.maxScore} ({attempt.percent}%)
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl border border-border bg-surface-subtle p-3 text-center">
                    <p className="text-xl font-bold text-success">
                      {review?.correctCount ?? '—'}
                    </p>
                    <p className="text-xs text-muted">{t('exam.correct')}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-surface-subtle p-3 text-center">
                    <p className="text-xl font-bold text-error">{review?.wrongCount ?? '—'}</p>
                    <p className="text-xs text-muted">{t('exam.wrong')}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-surface-subtle p-3 text-center">
                    <p className="text-xl font-bold text-muted">{review?.skippedCount ?? '—'}</p>
                    <p className="text-xs text-muted">{t('exam.skipped')}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-surface-subtle p-3 text-center">
                    <p className="text-xl font-bold text-foreground">
                      {formatDuration(review?.timeTakenSeconds)}
                    </p>
                    <p className="text-xs text-muted">{t('exam.timeTaken')}</p>
                  </div>
                </div>
              </>
            )}

            {attempt.security && (
              <div className="rounded-xl border border-border bg-surface-subtle p-3 text-center text-xs text-muted">
                {t('exam.securitySummary', {
                  defaultValue: 'Integrity signals',
                })}
                : focus {attempt.security.focusLossCount} · tabs{' '}
                {attempt.security.tabSwitchCount} · paste {attempt.security.pasteCount}
              </div>
            )}

            {(review?.pendingManualCount ?? 0) > 0 && !locked && (
              <p className="text-center text-xs text-muted">
                {t('exam.pendingManual', { count: review!.pendingManualCount })}
              </p>
            )}

            {!locked && (
              <div className="rounded-xl border border-border bg-surface p-4">
                <h2 className="text-sm font-semibold text-foreground">{t('cert.certificateOf')}</h2>
                {attempt.passed ? (
                  attempt.certificateId ? (
                    <div className="mt-2 space-y-2">
                      <p className="text-sm text-success">{t('exam.certIssued')}</p>
                      <p className="font-mono text-xs text-muted">
                        {t('cert.code')}: {attempt.certificateCode}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Link
                          to={`/app/organizations/${orgId}/certificates/${attempt.certificateId}`}
                        >
                          <Button size="sm">{t('cert.view')}</Button>
                        </Link>
                        <Link to={`/verify/${attempt.certificateCode}`} target="_blank">
                          <Button size="sm" variant="outline">
                            {t('cert.verifyLink')}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 space-y-2">
                      <p className="text-sm text-muted">{t('exam.certEligible')}</p>
                      <Button size="sm" onClick={() => void issueCert()} disabled={issuing}>
                        {issuing ? t('common.loading') : t('cert.issue')}
                      </Button>
                      {issueError && <p className="text-xs text-error">{issueError}</p>}
                    </div>
                  )
                ) : (
                  <p className="mt-2 text-sm text-muted">{t('exam.certNotEligible')}</p>
                )}
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-2">
              {!locked && (
                <Button variant="outline" size="sm" onClick={() => setShowReview((v) => !v)}>
                  {showReview ? t('exam.hideReview') : t('exam.showReview')}
                </Button>
              )}
              <Link to={`/app/organizations/${orgId}/exams`}>
                <Button variant="outline" size="sm">{t('exam.backToExams')}</Button>
              </Link>
            </div>

            {!locked && showReview && attempt.questions && (
              <ul className="space-y-4 border-t border-border pt-4">
                {attempt.questions.map((q, i) => (
                  <li
                    key={q.id}
                    className={cn(
                      'rounded-xl border p-4',
                      q.outcome === 'correct' && 'border-success/40 bg-success/5',
                      q.outcome === 'wrong' && 'border-error/40 bg-error/5',
                      q.outcome === 'skipped' && 'border-border bg-surface-subtle',
                      q.outcome === 'pending_manual' && 'border-warning/40 bg-warning/5'
                    )}
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium text-muted">#{i + 1}</span>
                      <Badge
                        variant={
                          q.outcome === 'correct'
                            ? 'success'
                            : q.outcome === 'wrong'
                              ? 'error'
                              : q.outcome === 'pending_manual'
                                ? 'warning'
                                : 'info'
                        }
                      >
                        {q.outcome === 'correct'
                          ? t('exam.correct')
                          : q.outcome === 'wrong'
                            ? t('exam.wrong')
                            : q.outcome === 'skipped'
                              ? t('exam.skipped')
                              : t('exam.pendingReview')}
                      </Badge>
                      <span className="text-xs text-muted">
                        {q.pointsEarned ?? 0}/{q.points} {t('exam.pts')}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{q.stem}</p>
                    {q.type === 'short_answer' ? (
                      <p className="mt-2 text-sm text-muted">
                        {t('exam.yourAnswer')}:{' '}
                        <span className="text-foreground">
                          {(q.userSelected?.[0] || '—').slice(0, 500)}
                        </span>
                      </p>
                    ) : (
                      <ul className="mt-2 space-y-1">
                        {(q.options || []).map((opt) => {
                          const userPick = q.userSelected?.includes(opt.id)
                          const isCorrect = q.correctAnswers?.includes(opt.id)
                          return (
                            <li
                              key={opt.id}
                              className={cn(
                                'rounded-lg px-2 py-1 text-xs',
                                isCorrect && 'bg-success/15 text-foreground',
                                userPick && !isCorrect && 'bg-error/15 text-foreground'
                              )}
                            >
                              {opt.text}
                              {isCorrect && ` · ${t('exam.correctOption')}`}
                              {userPick && !isCorrect && ` · ${t('exam.yourPick')}`}
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </Container>
    </div>
  )
}
