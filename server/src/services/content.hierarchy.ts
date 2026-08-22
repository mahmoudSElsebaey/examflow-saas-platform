import { Course } from '../models/Course.js'
import { Subject } from '../models/Subject.js'
import { Topic } from '../models/Topic.js'
import { Lesson } from '../models/Lesson.js'
import { AppError } from '../middlewares/errorHandler.js'
import type { SubjectDTO, TopicDTO, LessonDTO } from '../types/content.js'

function toSubjectDTO(s: InstanceType<typeof Subject>): SubjectDTO {
  return {
    id: s.id,
    organizationId: s.organizationId.toString(),
    courseId: s.courseId.toString(),
    title: s.title,
    code: s.code ?? null,
    description: s.description ?? null,
    order: s.order ?? 0,
    isActive: s.isActive,
    createdBy: s.createdBy.toString(),
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  }
}

function toTopicDTO(t: InstanceType<typeof Topic>): TopicDTO {
  return {
    id: t.id,
    organizationId: t.organizationId.toString(),
    subjectId: t.subjectId.toString(),
    title: t.title,
    description: t.description ?? null,
    order: t.order ?? 0,
    isActive: t.isActive,
    createdBy: t.createdBy.toString(),
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }
}

function toLessonDTO(l: InstanceType<typeof Lesson>): LessonDTO {
  return {
    id: l.id,
    organizationId: l.organizationId.toString(),
    topicId: l.topicId.toString(),
    title: l.title,
    content: l.content ?? null,
    durationMinutes: l.durationMinutes ?? null,
    order: l.order ?? 0,
    isActive: l.isActive,
    createdBy: l.createdBy.toString(),
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
  }
}

export async function listSubjects(
  orgId: string,
  courseId?: string
): Promise<SubjectDTO[]> {
  const filter: Record<string, unknown> = { organizationId: orgId, isActive: true }
  if (courseId) filter.courseId = courseId
  const rows = await Subject.find(filter).sort({ order: 1, createdAt: 1 })
  return rows.map(toSubjectDTO)
}

export async function createSubject(
  orgId: string,
  userId: string,
  data: { courseId: string; title: string; code?: string; description?: string; order?: number }
): Promise<SubjectDTO> {
  const course = await Course.findOne({ _id: data.courseId, organizationId: orgId, isActive: true })
  if (!course) throw new AppError('Course not found', 404, 'COURSE_NOT_FOUND')
  const subject = await Subject.create({
    organizationId: orgId,
    courseId: data.courseId,
    title: data.title.trim(),
    code: data.code?.trim() || null,
    description: data.description?.trim() || null,
    order: data.order ?? 0,
    createdBy: userId,
  })
  return toSubjectDTO(subject)
}

export async function updateSubject(
  orgId: string,
  subjectId: string,
  data: Partial<{ title: string; code: string | null; description: string | null; order: number; isActive: boolean }>
): Promise<SubjectDTO> {
  const subject = await Subject.findOne({ _id: subjectId, organizationId: orgId })
  if (!subject) throw new AppError('Subject not found', 404, 'SUBJECT_NOT_FOUND')
  if (data.title !== undefined) subject.title = data.title.trim()
  if (data.code !== undefined) subject.code = data.code
  if (data.description !== undefined) subject.description = data.description
  if (data.order !== undefined) subject.order = data.order
  if (data.isActive !== undefined) subject.isActive = data.isActive
  await subject.save()
  return toSubjectDTO(subject)
}

export async function deleteSubject(orgId: string, subjectId: string): Promise<void> {
  const subject = await Subject.findOne({ _id: subjectId, organizationId: orgId })
  if (!subject) throw new AppError('Subject not found', 404, 'SUBJECT_NOT_FOUND')
  subject.isActive = false
  await subject.save()
  await Topic.updateMany({ subjectId, organizationId: orgId }, { isActive: false })
  const topics = await Topic.find({ subjectId, organizationId: orgId }).select('_id')
  const topicIds = topics.map((t) => t._id)
  if (topicIds.length) {
    await Lesson.updateMany({ topicId: { $in: topicIds }, organizationId: orgId }, { isActive: false })
  }
}

export async function listTopics(
  orgId: string,
  subjectId?: string
): Promise<TopicDTO[]> {
  const filter: Record<string, unknown> = { organizationId: orgId, isActive: true }
  if (subjectId) filter.subjectId = subjectId
  const rows = await Topic.find(filter).sort({ order: 1, createdAt: 1 })
  return rows.map(toTopicDTO)
}

export async function createTopic(
  orgId: string,
  userId: string,
  data: { subjectId: string; title: string; description?: string; order?: number }
): Promise<TopicDTO> {
  const subject = await Subject.findOne({
    _id: data.subjectId,
    organizationId: orgId,
    isActive: true,
  })
  if (!subject) throw new AppError('Subject not found', 404, 'SUBJECT_NOT_FOUND')
  const topic = await Topic.create({
    organizationId: orgId,
    subjectId: data.subjectId,
    title: data.title.trim(),
    description: data.description?.trim() || null,
    order: data.order ?? 0,
    createdBy: userId,
  })
  return toTopicDTO(topic)
}

export async function updateTopic(
  orgId: string,
  topicId: string,
  data: Partial<{ title: string; description: string | null; order: number; isActive: boolean }>
): Promise<TopicDTO> {
  const topic = await Topic.findOne({ _id: topicId, organizationId: orgId })
  if (!topic) throw new AppError('Topic not found', 404, 'TOPIC_NOT_FOUND')
  if (data.title !== undefined) topic.title = data.title.trim()
  if (data.description !== undefined) topic.description = data.description
  if (data.order !== undefined) topic.order = data.order
  if (data.isActive !== undefined) topic.isActive = data.isActive
  await topic.save()
  return toTopicDTO(topic)
}

export async function deleteTopic(orgId: string, topicId: string): Promise<void> {
  const topic = await Topic.findOne({ _id: topicId, organizationId: orgId })
  if (!topic) throw new AppError('Topic not found', 404, 'TOPIC_NOT_FOUND')
  topic.isActive = false
  await topic.save()
  await Lesson.updateMany({ topicId, organizationId: orgId }, { isActive: false })
}

export async function listLessons(
  orgId: string,
  topicId?: string
): Promise<LessonDTO[]> {
  const filter: Record<string, unknown> = { organizationId: orgId, isActive: true }
  if (topicId) filter.topicId = topicId
  const rows = await Lesson.find(filter).sort({ order: 1, createdAt: 1 })
  return rows.map(toLessonDTO)
}

export async function getLesson(orgId: string, lessonId: string): Promise<LessonDTO> {
  const lesson = await Lesson.findOne({ _id: lessonId, organizationId: orgId, isActive: true })
  if (!lesson) throw new AppError('Lesson not found', 404, 'LESSON_NOT_FOUND')
  return toLessonDTO(lesson)
}

export async function createLesson(
  orgId: string,
  userId: string,
  data: {
    topicId: string
    title: string
    content?: string
    durationMinutes?: number
    order?: number
  }
): Promise<LessonDTO> {
  const topic = await Topic.findOne({
    _id: data.topicId,
    organizationId: orgId,
    isActive: true,
  })
  if (!topic) throw new AppError('Topic not found', 404, 'TOPIC_NOT_FOUND')
  const lesson = await Lesson.create({
    organizationId: orgId,
    topicId: data.topicId,
    title: data.title.trim(),
    content: data.content?.trim() || null,
    durationMinutes: data.durationMinutes ?? null,
    order: data.order ?? 0,
    createdBy: userId,
  })
  return toLessonDTO(lesson)
}

export async function updateLesson(
  orgId: string,
  lessonId: string,
  data: Partial<{
    title: string
    content: string | null
    durationMinutes: number | null
    order: number
    isActive: boolean
  }>
): Promise<LessonDTO> {
  const lesson = await Lesson.findOne({ _id: lessonId, organizationId: orgId })
  if (!lesson) throw new AppError('Lesson not found', 404, 'LESSON_NOT_FOUND')
  if (data.title !== undefined) lesson.title = data.title.trim()
  if (data.content !== undefined) lesson.content = data.content
  if (data.durationMinutes !== undefined) lesson.durationMinutes = data.durationMinutes
  if (data.order !== undefined) lesson.order = data.order
  if (data.isActive !== undefined) lesson.isActive = data.isActive
  await lesson.save()
  return toLessonDTO(lesson)
}

export async function deleteLesson(orgId: string, lessonId: string): Promise<void> {
  const lesson = await Lesson.findOne({ _id: lessonId, organizationId: orgId })
  if (!lesson) throw new AppError('Lesson not found', 404, 'LESSON_NOT_FOUND')
  lesson.isActive = false
  await lesson.save()
}
