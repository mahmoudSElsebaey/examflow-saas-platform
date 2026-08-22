import { Exam } from '../models/Exam.js'
import { ExamAttempt } from '../models/ExamAttempt.js'
import type { ExamDTO } from '../types/exam.js'

export function isExamAvailableNow(exam: {
  availableFrom?: Date | null
  availableTo?: Date | null
  status: string
}): boolean {
  if (exam.status !== 'published') return false
  const now = Date.now()
  if (exam.availableFrom && new Date(exam.availableFrom).getTime() > now) return false
  if (exam.availableTo && new Date(exam.availableTo).getTime() < now) return false
  return true
}

function toExamDTO(e: InstanceType<typeof Exam>): ExamDTO {
  return {
    id: e.id,
    organizationId: e.organizationId.toString(),
    title: e.title,
    description: e.description ?? null,
    status: e.status,
    questionIds: (e.questionIds || []).map((id) => id.toString()),
    timeLimitMinutes: e.timeLimitMinutes ?? null,
    passingScorePercent: e.passingScorePercent,
    shuffleQuestions: e.shuffleQuestions,
    shuffleOptions: e.shuffleOptions,
    maxAttempts: e.maxAttempts,
    totalPoints: e.totalPoints ?? 0,
    questionCount: (e.questionIds || []).length,
    availableFrom: e.availableFrom ? e.availableFrom.toISOString() : null,
    availableTo: e.availableTo ? e.availableTo.toISOString() : null,
    isAvailableNow: isExamAvailableNow(e),
    createdBy: e.createdBy.toString(),
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  }
}

export async function listAvailableExams(
  orgId: string,
  userId: string
): Promise<ExamDTO[]> {
  const exams = await Exam.find({
    organizationId: orgId,
    status: 'published',
  }).sort({ title: 1 })

  const result: ExamDTO[] = []
  for (const exam of exams) {
    if (!isExamAvailableNow(exam)) continue
    const submittedCount = await ExamAttempt.countDocuments({
      examId: exam.id,
      userId,
      status: { $in: ['submitted', 'timed_out'] },
    })
    if (submittedCount >= exam.maxAttempts) continue
    result.push(toExamDTO(exam))
  }
  return result
}
