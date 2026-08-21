export interface OrgAnalyticsDTO {
  examsCount: number
  publishedExamsCount: number
  questionsCount: number
  attemptsCount: number
  completedAttemptsCount: number
  averagePercent: number | null
  passRate: number | null
  recentAttempts: {
    id: string
    examId: string
    examTitle: string
    userId: string
    status: string
    percent: number | null
    passed: boolean | null
    submittedAt: string | null
  }[]
}

export interface ExamAnalyticsDTO {
  examId: string
  examTitle: string
  attemptsCount: number
  completedCount: number
  averagePercent: number | null
  passRate: number | null
  minPercent: number | null
  maxPercent: number | null
  attempts: {
    id: string
    userId: string
    status: string
    score: number | null
    maxScore: number | null
    percent: number | null
    passed: boolean | null
    startedAt: string
    submittedAt: string | null
  }[]
}
