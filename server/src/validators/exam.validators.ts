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
