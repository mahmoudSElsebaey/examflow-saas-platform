export type ExamStatus = 'draft' | 'published' | 'archived'
export type AttemptStatus = 'in_progress' | 'submitted' | 'timed_out'

export interface Exam {
  id: string
  organizationId: string
  title: string
  description?: string | null
  status: ExamStatus
  questionIds: string[]
  timeLimitMinutes?: number | null
  passingScorePercent: number
  shuffleQuestions: boolean
  shuffleOptions: boolean
  maxAttempts: number
  totalPoints: number
  questionCount: number
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface AttemptAnswer {
  questionId: string
  selected: string[]
}

export interface AttemptQuestion {
  id: string
  type: string
  stem: string
  options: { id: string; text: string }[]
  points: number
  difficulty: string
}

export interface ExamAttempt {
  id: string
  examId: string
  organizationId: string
  userId: string
  status: AttemptStatus
  startedAt: string
  submittedAt?: string | null
  expiresAt?: string | null
  answers: AttemptAnswer[]
  score?: number | null
  maxScore?: number | null
  percent?: number | null
  passed?: boolean | null
  questions?: AttemptQuestion[]
  examTitle?: string
}
