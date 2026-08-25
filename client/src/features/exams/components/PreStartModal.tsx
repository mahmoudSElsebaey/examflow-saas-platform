import { useTranslation } from 'react-i18next'
import { AlertTriangle, Clock, Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

type Props = {
  open: boolean
  examTitle: string
  timeLimitMinutes?: number | null
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export function PreStartModal({ open, examTitle, timeLimitMinutes, onConfirm, onCancel, loading }: Props) {
  const { t } = useTranslation()
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close"
        onClick={onCancel}
      />
      <Card className="relative z-10 w-full max-w-lg border-border shadow-2xl">
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/15 text-warning">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {t('exam.preStartTitle', { defaultValue: 'Before you begin' })}
              </h2>
              <p className="text-sm text-muted">{examTitle}</p>
            </div>
          </div>

          <p className="text-sm text-foreground">
            {t('exam.preStartBody', {
              defaultValue:
                'Please read carefully. Once you start, the attempt is recorded and cannot be cancelled.',
            })}
          </p>

          <ul className="space-y-2 text-sm text-foreground">
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                {timeLimitMinutes != null
                  ? t('exam.preStartTime', {
                      minutes: timeLimitMinutes,
                      defaultValue: `Time limit: ${timeLimitMinutes} minutes`,
                    })
                  : t('exam.preStartNoTime', { defaultValue: 'No fixed time limit' })}
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                {t('exam.preStartRules1', {
                  defaultValue: 'Do not switch tabs or leave the exam window.',
                })}
              </span>
            </li>
            <li className="text-sm text-muted">
              {t('exam.preStartRules2', {
                defaultValue: 'Copy/paste may be recorded for integrity review.',
              })}
            </li>
            <li className="text-sm text-muted">
              {t('exam.preStartRules3', {
                defaultValue: 'Answers are autosaved; submit when finished.',
              })}
            </li>
            <li className="text-sm font-medium text-foreground">
              {t('exam.preStartRules4', {
                defaultValue: 'You cannot undo starting this attempt.',
              })}
            </li>
          </ul>

          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              {t('exam.preStartCancel', { defaultValue: 'Not now' })}
            </Button>
            <Button type="button" onClick={onConfirm} disabled={loading}>
              {loading
                ? t('common.loading')
                : t('exam.preStartConfirm', { defaultValue: 'I understand — start exam' })}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
