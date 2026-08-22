import { LessonProgress } from '../models/LessonProgress.js'
import { Lesson } from '../models/Lesson.js'
import { AppError } from '../middlewares/errorHandler.js'

export type ProgressDTO = {
  id: string
  lessonId: string
  status: 'viewed' | 'completed'
  viewedAt: string
  completedAt: string | null
}

function toDTO(p: InstanceType<typeof LessonProgress>): ProgressDTO {
  return {
    id: p.id,
    lessonId: p.lessonId.toString(),
    status: p.status,
    viewedAt: p.viewedAt.toISOString(),
    completedAt: p.completedAt?.toISOString() ?? null,
  }
}

export async function markLessonViewed(
  orgId: string,
  userId: string,
  lessonId: string
): Promise<ProgressDTO> {
  const lesson = await Lesson.findOne({
    _id: lessonId,
    organizationId: orgId,
    isActive: true,
  })
  if (!lesson) throw new AppError('Lesson not found', 404, 'LESSON_NOT_FOUND')

  let row = await LessonProgress.findOne({ organizationId: orgId, userId, lessonId })
  if (!row) {
    row = await LessonProgress.create({
      organizationId: orgId,
      userId,
      lessonId,
      status: 'viewed',
      viewedAt: new Date(),
    })
  }
  return toDTO(row)
}

export async function markLessonCompleted(
  orgId: string,
  userId: string,
  lessonId: string
): Promise<ProgressDTO> {
  const lesson = await Lesson.findOne({
    _id: lessonId,
    organizationId: orgId,
    isActive: true,
  })
  if (!lesson) throw new AppError('Lesson not found', 404, 'LESSON_NOT_FOUND')

  let row = await LessonProgress.findOne({ organizationId: orgId, userId, lessonId })
  if (!row) {
    row = await LessonProgress.create({
      organizationId: orgId,
      userId,
      lessonId,
      status: 'completed',
      viewedAt: new Date(),
      completedAt: new Date(),
    })
  } else if (row.status !== 'completed') {
    row.status = 'completed'
    row.completedAt = new Date()
    await row.save()
  }
  return toDTO(row)
}

export async function listMyProgress(
  orgId: string,
  userId: string
): Promise<{ items: ProgressDTO[]; completedCount: number; viewedCount: number }> {
  const items = await LessonProgress.find({ organizationId: orgId, userId }).sort({
    updatedAt: -1,
  })
  return {
    items: items.map(toDTO),
    completedCount: items.filter((p) => p.status === 'completed').length,
    viewedCount: items.length,
  }
}

export async function getProgressMapForLessons(
  orgId: string,
  userId: string,
  lessonIds: string[]
): Promise<Record<string, ProgressDTO>> {
  if (lessonIds.length === 0) return {}
  const rows = await LessonProgress.find({
    organizationId: orgId,
    userId,
    lessonId: { $in: lessonIds },
  })
  const map: Record<string, ProgressDTO> = {}
  for (const r of rows) {
    map[r.lessonId.toString()] = toDTO(r)
  }
  return map
}
