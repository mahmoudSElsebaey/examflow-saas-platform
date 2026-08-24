import { z } from 'zod'

export const createExamSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  questionIds: z.array(z.string()).optional(),
  timeLimitMinutes: z.number().min(1).max(600).nullable().optional(),
  passingScorePercent: z.number().min(0).max(100).optional(),
  shuffleQuestions: z.boolean().optional(),
  shuffleOptions: z.boolean().optional(),
  maxAttempts: z.number().min(1).max(20).optional(),
  trackTabSwitch: z.boolean().optional(),
  trackPaste: z.boolean().optional(),
  warnOnLeave: z.boolean().optional(),
  showResultsImmediately: z.boolean().optional(),
  resultsDelayMinutes: z.number().min(0).max(10080).nullable().optional(),
})

export const updateExamSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().max(2000).nullable().optional(),
  questionIds: z.array(z.string()).optional(),
  timeLimitMinutes: z.number().min(1).max(600).nullable().optional(),
  passingScorePercent: z.number().min(0).max(100).optional(),
  shuffleQuestions: z.boolean().optional(),
  shuffleOptions: z.boolean().optional(),
  maxAttempts: z.number().min(1).max(20).optional(),
  trackTabSwitch: z.boolean().optional(),
  trackPaste: z.boolean().optional(),
  warnOnLeave: z.boolean().optional(),
  showResultsImmediately: z.boolean().optional(),
  resultsDelayMinutes: z.number().min(0).max(10080).nullable().optional(),
})

export const saveAnswersSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      selected: z.array(z.string()),
    })
  ),
})

export const submitAttemptSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string(),
        selected: z.array(z.string()),
      })
    )
    .optional(),
})

export const manualGradeSchema = z.object({
  grades: z
    .array(
      z.object({
        questionId: z.string().min(1),
        points: z.number().min(0),
        feedback: z.string().max(2000).optional().nullable(),
      })
    )
    .min(1),
})

export const securityEventSchema = z.object({
  type: z.enum(['focus_loss', 'tab_switch', 'visibility_hidden', 'paste', 'copy', 'leave_warn']),
  meta: z.string().max(200).optional().nullable(),
})

export type ManualGradeInput = z.infer<typeof manualGradeSchema>
