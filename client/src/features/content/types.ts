export type QuestionType = 'mcq_single' | 'mcq_multiple' | 'true_false' | 'short_answer'
export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Course {
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

export interface QuestionBank {
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

export interface Question {
  id: string
  organizationId: string
  bankId: string
  type: QuestionType
  stem: string
  options: { id: string; text: string }[]
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
