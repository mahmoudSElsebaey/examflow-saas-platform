import { useCallback, useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Clock,
  Layers,
} from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import * as contentApi from '../api/contentApi'
import type { Course, Lesson, Subject, Topic } from '../types'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { OrgWorkspaceLayout } from '@/components/layout/OrgWorkspaceLayout'

export function OrgLearnPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const lessonIdParam = searchParams.get('lesson')
  const { t } = useTranslation()
  const { accessToken } = useAuth()

  const [courses, setCourses] = useState<Course[]>([])
  const [courseId, setCourseId] = useState('')
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [topicsBySubject, setTopicsBySubject] = useState<Record<string, Topic[]>>({})
  const [lessonsByTopic, setLessonsByTopic] = useState<Record<string, Lesson[]>>({})
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({})
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({})
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [lessonLoading, setLessonLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadCourses = useCallback(async () => {
    if (!accessToken || !orgId) return
    setLoading(true)
    setError(null)
    try {
      const res = await contentApi.listCoursesApi(accessToken, orgId)
      const list = res.data?.courses ?? []
      setCourses(list)
      if (list[0] && !courseId) setCourseId(list[0].id)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }, [accessToken, orgId, courseId, t])

  useEffect(() => {
    void loadCourses()
  }, [loadCourses])

  useEffect(() => {
    if (!accessToken || !orgId || !courseId) return
    void (async () => {
      try {
        const res = await contentApi.listSubjectsApi(accessToken, orgId, courseId)
        setSubjects(res.data?.subjects ?? [])
        setTopicsBySubject({})
        setLessonsByTopic({})
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : t('errors.generic'))
      }
    })()
  }, [accessToken, orgId, courseId, t])

  useEffect(() => {
    if (!lessonIdParam || !accessToken || !orgId) {
      setActiveLesson(null)
      return
    }
    void (async () => {
      setLessonLoading(true)
      try {
        const res = await contentApi.getLessonApi(accessToken, orgId, lessonIdParam)
        setActiveLesson(res.data?.lesson ?? null)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : t('errors.generic'))
        setActiveLesson(null)
      } finally {
        setLessonLoading(false)
      }
    })()
  }, [lessonIdParam, accessToken, orgId, t])

  const toggleSubject = async (id: string) => {
    const next = !expandedSubjects[id]
    setExpandedSubjects((s) => ({ ...s, [id]: next }))
    if (next && !topicsBySubject[id] && accessToken && orgId) {
      try {
        const res = await contentApi.listTopicsApi(accessToken, orgId, id)
        setTopicsBySubject((m) => ({ ...m, [id]: res.data?.topics ?? [] }))
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : t('errors.generic'))
      }
    }
  }

  const toggleTopic = async (id: string) => {
    const next = !expandedTopics[id]
    setExpandedTopics((s) => ({ ...s, [id]: next }))
    if (next && !lessonsByTopic[id] && accessToken && orgId) {
      try {
        const res = await contentApi.listLessonsApi(accessToken, orgId, id)
        setLessonsByTopic((m) => ({ ...m, [id]: res.data?.lessons ?? [] }))
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : t('errors.generic'))
      }
    }
  }

  const openLesson = (id: string) => {
    setSearchParams({ lesson: id })
  }

  const closeLesson = () => {
    setSearchParams({})
  }

  if (!orgId) return null

  return (
    <OrgWorkspaceLayout orgId={orgId}>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t('learn.title')}
          </h1>
          <p className="mt-1 text-muted">{t('learn.subtitle')}</p>
        </div>

        {error && (
          <Alert variant="error" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : courses.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center text-sm text-muted">
              {t('learn.noCourses')}
            </CardContent>
          </Card>
        ) : lessonIdParam ? (
          <div className="space-y-4">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={closeLesson}>
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              {t('learn.backToCurriculum')}
            </Button>
            {lessonLoading ? (
              <div className="flex justify-center py-16">
                <Spinner />
              </div>
            ) : !activeLesson ? (
              <p className="text-sm text-muted">{t('learn.lessonNotFound')}</p>
            ) : (
              <Card>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{t('content.lesson')}</Badge>
                    {activeLesson.durationMinutes != null && (
                      <span className="inline-flex items-center gap-1 text-xs text-muted">
                        <Clock className="h-3.5 w-3.5" />
                        {activeLesson.durationMinutes} {t('content.min')}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-foreground">{activeLesson.title}</h2>
                  {activeLesson.content ? (
                    <div className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground">
                      {activeLesson.content}
                    </div>
                  ) : (
                    <p className="text-sm text-muted">{t('learn.noContent')}</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground" htmlFor="learn-course">
                {t('content.courseTitle')}
              </label>
              <select
                id="learn-course"
                className="w-full max-w-md rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {subjects.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">{t('learn.noSubjects')}</p>
            ) : (
              <ul className="space-y-2">
                {subjects.map((s) => (
                  <li key={s.id} className="rounded-xl border border-border bg-surface">
                    <div className="flex items-center gap-2 px-3 py-2">
                      <button
                        type="button"
                        className="rounded p-1 hover:bg-surface-subtle"
                        onClick={() => void toggleSubject(s.id)}
                      >
                        {expandedSubjects[s.id] ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                        )}
                      </button>
                      <Layers className="h-4 w-4 text-primary" />
                      <span className="flex-1 text-sm font-semibold">{s.title}</span>
                      <Badge variant="secondary">{t('content.subject')}</Badge>
                    </div>
                    {expandedSubjects[s.id] && (
                      <ul className="border-t border-border/60 bg-surface-subtle/40 px-3 py-2 ps-10">
                        {(topicsBySubject[s.id] ?? []).length === 0 ? (
                          <li className="py-2 text-xs text-muted">{t('content.noTopics')}</li>
                        ) : (
                          (topicsBySubject[s.id] ?? []).map((tp) => (
                            <li
                              key={tp.id}
                              className="mb-1 rounded-lg border border-border/50 bg-surface"
                            >
                              <div className="flex items-center gap-2 px-2 py-1.5">
                                <button
                                  type="button"
                                  className="rounded p-1 hover:bg-surface-subtle"
                                  onClick={() => void toggleTopic(tp.id)}
                                >
                                  {expandedTopics[tp.id] ? (
                                    <ChevronDown className="h-3.5 w-3.5" />
                                  ) : (
                                    <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
                                  )}
                                </button>
                                <BookOpen className="h-3.5 w-3.5 text-primary" />
                                <span className="flex-1 text-sm font-medium">{tp.title}</span>
                                <Badge variant="secondary">{t('content.topic')}</Badge>
                              </div>
                              {expandedTopics[tp.id] && (
                                <ul className="border-t border-border/40 px-2 py-1 ps-8">
                                  {(lessonsByTopic[tp.id] ?? []).length === 0 ? (
                                    <li className="py-1 text-xs text-muted">
                                      {t('content.noLessons')}
                                    </li>
                                  ) : (
                                    (lessonsByTopic[tp.id] ?? []).map((ls) => (
                                      <li key={ls.id}>
                                        <button
                                          type="button"
                                          className="mb-1 flex w-full items-center gap-2 rounded px-2 py-1.5 text-start text-sm hover:bg-surface-subtle"
                                          onClick={() => openLesson(ls.id)}
                                        >
                                          <span className="flex-1 font-medium text-foreground">
                                            {ls.title}
                                          </span>
                                          {ls.durationMinutes != null && (
                                            <span className="text-xs text-muted">
                                              {ls.durationMinutes} {t('content.min')}
                                            </span>
                                          )}
                                          <Badge variant="secondary">{t('content.lesson')}</Badge>
                                        </button>
                                      </li>
                                    ))
                                  )}
                                </ul>
                              )}
                            </li>
                          ))
                        )}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </OrgWorkspaceLayout>
  )
}
