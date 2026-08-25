import type { TFunction } from 'i18next'

/** Build the pre-exam rules message (student must acknowledge before start). */
export function buildPreStartMessage(
  t: TFunction,
  exam: { timeLimitMinutes?: number | null; title?: string }
): string {
  const lines = [
    t('exam.preStartTitle', { defaultValue: 'Before you begin' }) +
      (exam.title ? `: ${exam.title}` : ''),
    '',
    t('exam.preStartBody', {
      defaultValue:
        'Please read carefully. Once you start, the attempt is recorded and cannot be cancelled.',
    }),
    '',
    exam.timeLimitMinutes != null
      ? t('exam.preStartTime', {
          minutes: exam.timeLimitMinutes,
          defaultValue: `Time limit: ${exam.timeLimitMinutes} minutes`,
        })
      : t('exam.preStartNoTime', { defaultValue: 'No fixed time limit' }),
    t('exam.preStartRules1', {
      defaultValue: 'Do not switch tabs or leave the exam window.',
    }),
    t('exam.preStartRules2', {
      defaultValue: 'Copy/paste may be recorded for integrity review.',
    }),
    t('exam.preStartRules3', {
      defaultValue: 'Answers are autosaved; submit when finished.',
    }),
    t('exam.preStartRules4', {
      defaultValue: 'You cannot undo starting this attempt.',
    }),
    '',
    t('exam.preStartConfirm', {
      defaultValue: 'Press OK to start, or Cancel to go back.',
    }),
  ]
  return lines.join('\n')
}
