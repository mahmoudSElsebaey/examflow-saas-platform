export type ExamStatus = 'draft' | 'published' | 'archived'
export type AttemptStatus = 'in_progress' | 'submitted' | 'timed_out'

export interface ExamDTO {
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
  availableFrom?: string | null
  availableTo?: string | null
  isAvailableNow?: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface AttemptAnswer {
  questionId: string
  selected: string[]
  manualScore?: number | null
  feedback?: string | null
  gradedAt?: string | null
}

export interface AttemptQuestionView {
  id: string
  type: string
  stem: string
  options: { id: string; text: string }[]
  points: number
  difficulty: string
  correctAnswers?: string[]
  userSelected?: string[]
  outcome?: 'correct' | 'wrong' | 'skipped' | 'pending_manual'
  pointsEarned?: number
  feedback?: string | null
}

export interface AttemptReviewSummary {
  correctCount: number
  wrongCount: number
  skippedCount: number
  pendingManualCount: number
  timeTakenSeconds: number | null
}

export interface ExamAttemptDTO {
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
  needsManualGrading?: boolean
  questions?: AttemptQuestionView[]
  examTitle?: string
  studentName?: string
  review?: AttemptReviewSummary
  certificateId?: string | null
  certificateCode?: string | null
}

export interface GradingQueueItem {
  id: string
  examId: string
  examTitle: string
  userId: string
  studentName: string
  status: AttemptStatus
  submittedAt: string | null
  pendingManualCount: number
  score: number | null
  maxScore: number | null
  percent: number | null
}
