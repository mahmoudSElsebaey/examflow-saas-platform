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

export function toExamScheduleFields(e: InstanceType<typeof Exam>) {
  return {
    availableFrom: e.availableFrom ? e.availableFrom.toISOString() : null,
    availableTo: e.availableTo ? e.availableTo.toISOString() : null,
    isAvailableNow: isExamAvailableNow(e),
  }
}

export async function listAvailableExams(
  orgId: string,
  userId: string,
  toExamDTO: (e: InstanceType<typeof Exam>) => ExamDTO
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
