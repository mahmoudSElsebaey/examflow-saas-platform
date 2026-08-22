import { z } from 'zod'

export const createCourseSchema = z.object({
  title: z.string().min(2).max(200),
  code: z.string().max(40).optional(),
  description: z.string().max(1000).optional(),
})

export const updateCourseSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  code: z.string().max(40).nullable().optional(),
  description: z.string().max(1000).nullable().optional(),
  isActive: z.boolean().optional(),
})

export const createBankSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(1000).optional(),
  courseId: z.string().optional(),
})

export const updateBankSchema = z.object({
  name: z.string().min(2).max(200).optional(),
  description: z.string().max(1000).nullable().optional(),
  courseId: z.string().nullable().optional(),
})

export const createQuestionSchema = z.object({
  type: z.enum(['mcq_single', 'mcq_multiple', 'true_false', 'short_answer']),
  stem: z.string().min(1).max(5000),
  options: z
    .array(z.object({ text: z.string().min(1).max(1000) }))
    .optional(),
  correctAnswers: z.array(z.string()).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  tags: z.array(z.string().max(40)).optional(),
  points: z.number().min(0).max(100).optional(),
})

export const updateQuestionSchema = z.object({
  stem: z.string().min(1).max(5000).optional(),
  options: z
    .array(z.object({ id: z.string().optional(), text: z.string().min(1).max(1000) }))
    .optional(),
  correctAnswers: z.array(z.string()).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  tags: z.array(z.string().max(40)).optional(),
  points: z.number().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
})

export const createSubjectSchema = z.object({
  courseId: z.string().min(1),
  title: z.string().min(2).max(200),
  code: z.string().max(40).optional(),
  description: z.string().max(1000).optional(),
  order: z.number().min(0).optional(),
})

export const updateSubjectSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  code: z.string().max(40).nullable().optional(),
  description: z.string().max(1000).nullable().optional(),
  order: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
})

export const createTopicSchema = z.object({
  subjectId: z.string().min(1),
  title: z.string().min(2).max(200),
  description: z.string().max(1000).optional(),
  order: z.number().min(0).optional(),
})

export const updateTopicSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  description: z.string().max(1000).nullable().optional(),
  order: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
})

export const createLessonSchema = z.object({
  topicId: z.string().min(1),
  title: z.string().min(2).max(200),
  content: z.string().max(50000).optional(),
  durationMinutes: z.number().min(0).max(10080).optional(),
  order: z.number().min(0).optional(),
})

export const updateLessonSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  content: z.string().max(50000).nullable().optional(),
  durationMinutes: z.number().min(0).max(10080).nullable().optional(),
  order: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
})
