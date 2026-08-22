export type QuestionType =
  | 'mcq_single'
  | 'mcq_multiple'
  | 'true_false'
  | 'short_answer'

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface CourseDTO {
  id: string
  organizationId: string
  title: string
  code?: string | null
  description?: string | null
  isActive: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface QuestionBankDTO {
  id: string
  organizationId: string
  courseId?: string | null
  name: string
  description?: string | null
  questionCount: number
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface QuestionOption {
  id: string
  text: string
}

export interface QuestionDTO {
  id: string
  organizationId: string
  bankId: string
  type: QuestionType
  stem: string
  options: QuestionOption[]
  correctAnswers: string[]
  difficulty: Difficulty
  tags: string[]
  points: number
  version: number
  isActive: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface SubjectDTO {
  id: string
  organizationId: string
  courseId: string
  title: string
  code?: string | null
  description?: string | null
  order: number
  isActive: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface TopicDTO {
  id: string
  organizationId: string
  subjectId: string
  title: string
  description?: string | null
  order: number
  isActive: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface LessonDTO {
  id: string
  organizationId: string
  topicId: string
  title: string
  content?: string | null
  durationMinutes?: number | null
  order: number
  isActive: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}
