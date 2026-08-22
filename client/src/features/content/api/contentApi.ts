import { appConfig } from '@/config/app'
import type { ApiResponse } from '@/features/auth/types'
import type { Course, Question, QuestionBank, QuestionType, Difficulty, Subject, Topic, Lesson } from '../types'

const base = (orgId: string) => `${appConfig.API_BASE_URL}/organizations/${orgId}`

async function request<T>(
  path: string,
  accessToken: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const res = await fetch(path, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...(options.headers || {}),
    },
  })
  const json = (await res.json()) as ApiResponse<T>
  if (!res.ok) {
    throw Object.assign(new Error(json.message || 'Request failed'), {
      status: res.status,
      errorCode: json.errorCode,
    })
  }
  return json
}

export async function listCoursesApi(token: string, orgId: string) {
  return request<{ courses: Course[] }>(`${base(orgId)}/courses`, token)
}

export async function createCourseApi(
  token: string,
  orgId: string,
  body: { title: string; code?: string; description?: string }
) {
  return request<{ course: Course }>(`${base(orgId)}/courses`, token, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function listBanksApi(token: string, orgId: string, courseId?: string) {
  const q = courseId ? `?courseId=${courseId}` : ''
  return request<{ banks: QuestionBank[] }>(`${base(orgId)}/banks${q}`, token)
}

export async function createBankApi(
  token: string,
  orgId: string,
  body: { name: string; description?: string; courseId?: string }
) {
  return request<{ bank: QuestionBank }>(`${base(orgId)}/banks`, token, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function getBankApi(token: string, orgId: string, bankId: string) {
  return request<{ bank: QuestionBank }>(`${base(orgId)}/banks/${bankId}`, token)
}

export async function listQuestionsApi(token: string, orgId: string, bankId: string) {
  return request<{ questions: Question[] }>(
    `${base(orgId)}/banks/${bankId}/questions`,
    token
  )
}

export async function createQuestionApi(
  token: string,
  orgId: string,
  bankId: string,
  body: {
    type: QuestionType
    stem: string
    options?: { text: string }[]
    correctAnswers?: string[]
    difficulty?: Difficulty
    tags?: string[]
    points?: number
  }
) {
  return request<{ question: Question }>(
    `${base(orgId)}/banks/${bankId}/questions`,
    token,
    { method: 'POST', body: JSON.stringify(body) }
  )
}

export async function deleteQuestionApi(token: string, orgId: string, questionId: string) {
  return request<null>(`${base(orgId)}/questions/${questionId}`, token, {
    method: 'DELETE',
  })
}

// Hierarchy APIs

export async function listSubjectsApi(token: string, orgId: string, courseId?: string) {
  const q = courseId ? `?courseId=${courseId}` : ''
  return request<{ subjects: Subject[] }>(`${base(orgId)}/subjects${q}`, token)
}

export async function createSubjectApi(
  token: string,
  orgId: string,
  body: { courseId: string; title: string; code?: string; description?: string; order?: number }
) {
  return request<{ subject: Subject }>(`${base(orgId)}/subjects`, token, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function deleteSubjectApi(token: string, orgId: string, subjectId: string) {
  return request<null>(`${base(orgId)}/subjects/${subjectId}`, token, { method: 'DELETE' })
}

export async function listTopicsApi(token: string, orgId: string, subjectId?: string) {
  const q = subjectId ? `?subjectId=${subjectId}` : ''
  return request<{ topics: Topic[] }>(`${base(orgId)}/topics${q}`, token)
}

export async function createTopicApi(
  token: string,
  orgId: string,
  body: { subjectId: string; title: string; description?: string; order?: number }
) {
  return request<{ topic: Topic }>(`${base(orgId)}/topics`, token, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function deleteTopicApi(token: string, orgId: string, topicId: string) {
  return request<null>(`${base(orgId)}/topics/${topicId}`, token, { method: 'DELETE' })
}

export async function getLessonApi(token: string, orgId: string, lessonId: string) {
  return request<{ lesson: Lesson }>(`${base(orgId)}/lessons/${lessonId}`, token)
}

export async function listLessonsApi(token: string, orgId: string, topicId?: string) {
  const q = topicId ? `?topicId=${topicId}` : ''
  return request<{ lessons: Lesson[] }>(`${base(orgId)}/lessons${q}`, token)
}

export async function createLessonApi(
  token: string,
  orgId: string,
  body: {
    topicId: string
    title: string
    content?: string
    durationMinutes?: number
    order?: number
  }
) {
  return request<{ lesson: Lesson }>(`${base(orgId)}/lessons`, token, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function deleteLessonApi(token: string, orgId: string, lessonId: string) {
  return request<null>(`${base(orgId)}/lessons/${lessonId}`, token, { method: 'DELETE' })
}
