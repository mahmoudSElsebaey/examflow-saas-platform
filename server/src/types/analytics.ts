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
    studentName?: string
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
    studentName?: string
    status: string
    score: number | null
    maxScore: number | null
    percent: number | null
    passed: boolean | null
    focusLossCount?: number
    tabSwitchCount?: number
    pasteCount?: number
    startedAt: string
    submittedAt: string | null
  }[]
}

export interface StudentHistoryDTO {
  attemptsCount: number
  completedCount: number
  averagePercent: number | null
  passRate: number | null
  lessonsViewed: number
  lessonsCompleted: number
  attempts: {
    id: string
    examId: string
    examTitle: string
    status: string
    percent: number | null
    passed: boolean | null
    startedAt: string
    submittedAt: string | null
  }[]
  recentLessons: {
    lessonId: string
    lessonTitle: string
    status: string
    viewedAt: string
    completedAt: string | null
  }[]
}
