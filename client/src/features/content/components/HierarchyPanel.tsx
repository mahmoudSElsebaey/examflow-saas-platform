import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ChevronRight, Layers, Plus, Trash2 } from 'lucide-react'
import * as contentApi from '../api/contentApi'
import type { Course, Lesson, Subject, Topic } from '../types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { Alert, AlertDescription } from '@/components/ui/Alert'

type Props = {
  orgId: string
  accessToken: string
  courses: Course[]
}

export function HierarchyPanel({ orgId, accessToken, courses }: Props) {
  const { t } = useTranslation()
  const [courseId, setCourseId] = useState(courses[0]?.id ?? '')
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [topicsBySubject, setTopicsBySubject] = useState<Record<string, Topic[]>>({})
  const [lessonsByTopic, setLessonsByTopic] = useState<Record<string, Lesson[]>>({})
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({})
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [subjectTitle, setSubjectTitle] = useState('')
  const [topicTitle, setTopicTitle] = useState('')
  const [topicSubjectId, setTopicSubjectId] = useState('')
  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonTopicId, setLessonTopicId] = useState('')
  const [busy, setBusy] = useState(false)

  const loadSubjects = useCallback(async () => {
    if (!courseId || !accessToken) return
    setLoading(true)
    setError(null)
    try {
      const res = await contentApi.listSubjectsApi(accessToken, orgId, courseId)
      setSubjects(res.data?.subjects ?? [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }, [accessToken, orgId, courseId])

  useEffect(() => {
    if (!courseId && courses[0]?.id) setCourseId(courses[0].id)
  }, [courses, courseId])

  useEffect(() => {
    void loadSubjects()
    setTopicsBySubject({})
    setLessonsByTopic({})
  }, [loadSubjects])

  const toggleSubject = async (id: string) => {
    const next = !expandedSubjects[id]
    setExpandedSubjects((s) => ({ ...s, [id]: next }))
    if (next && !topicsBySubject[id]) {
      try {
        const res = await contentApi.listTopicsApi(accessToken, orgId, id)
        setTopicsBySubject((m) => ({ ...m, [id]: res.data?.topics ?? [] }))
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed')
      }
    }
  }

  const toggleTopic = async (id: string) => {
    const next = !expandedTopics[id]
    setExpandedTopics((s) => ({ ...s, [id]: next }))
    if (next && !lessonsByTopic[id]) {
      try {
        const res = await contentApi.listLessonsApi(accessToken, orgId, id)
        setLessonsByTopic((m) => ({ ...m, [id]: res.data?.lessons ?? [] }))
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed')
      }
    }
  }

  const onCreateSubject = async () => {
    if (!subjectTitle.trim() || !courseId) return
    setBusy(true)
    setError(null)
    try {
      await contentApi.createSubjectApi(accessToken, orgId, {
        courseId,
        title: subjectTitle.trim(),
      })
      setSubjectTitle('')
      await loadSubjects()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setBusy(false)
    }
  }

  const onCreateTopic = async () => {
    if (!topicTitle.trim() || !topicSubjectId) return
    setBusy(true)
    setError(null)
    try {
      await contentApi.createTopicApi(accessToken, orgId, {
        subjectId: topicSubjectId,
        title: topicTitle.trim(),
      })
      setTopicTitle('')
      const res = await contentApi.listTopicsApi(accessToken, orgId, topicSubjectId)
      setTopicsBySubject((m) => ({ ...m, [topicSubjectId]: res.data?.topics ?? [] }))
      setExpandedSubjects((s) => ({ ...s, [topicSubjectId]: true }))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setBusy(false)
    }
  }

  const onCreateLesson = async () => {
    if (!lessonTitle.trim() || !lessonTopicId) return
    setBusy(true)
    setError(null)
    try {
      await contentApi.createLessonApi(accessToken, orgId, {
        topicId: lessonTopicId,
        title: lessonTitle.trim(),
      })
      setLessonTitle('')
      const res = await contentApi.listLessonsApi(accessToken, orgId, lessonTopicId)
      setLessonsByTopic((m) => ({ ...m, [lessonTopicId]: res.data?.lessons ?? [] }))
      setExpandedTopics((s) => ({ ...s, [lessonTopicId]: true }))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed')
    } finally {
      setBusy(false)
    }
  }

  const onDeleteSubject = async (id: string) => {
    if (!confirm(t('content.confirmDeleteSubject'))) return
    try {
      await contentApi.deleteSubjectApi(accessToken, orgId, id)
      await loadSubjects()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed')
    }
  }

  const onDeleteTopic = async (subjectId: string, id: string) => {
    if (!confirm(t('content.confirmDeleteTopic'))) return
    try {
      await contentApi.deleteTopicApi(accessToken, orgId, id)
      const res = await contentApi.listTopicsApi(accessToken, orgId, subjectId)
      setTopicsBySubject((m) => ({ ...m, [subjectId]: res.data?.topics ?? [] }))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed')
    }
  }

  const onDeleteLesson = async (topicId: string, id: string) => {
    if (!confirm(t('content.confirmDeleteLesson'))) return
    try {
      await contentApi.deleteLessonApi(accessToken, orgId, id)
      const res = await contentApi.listLessonsApi(accessToken, orgId, topicId)
      setLessonsByTopic((m) => ({ ...m, [topicId]: res.data?.lessons ?? [] }))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed')
    }
  }

  if (!courses.length) {
    return <p className="text-sm text-muted">{t('content.hierarchyNeedCourse')}</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Label htmlFor="hier-course">{t('content.courseTitle')}</Label>
          <select
            id="hier-course"
            className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
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
      </div>

      {error && (
        <Alert variant="error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="border-border/60">
        <CardContent className="space-y-3 pt-5">
          <p className="text-sm font-semibold text-foreground">{t('content.addSubject')}</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={subjectTitle}
              onChange={(e) => setSubjectTitle(e.target.value)}
              placeholder={t('content.subjectTitle')}
            />
            <Button disabled={busy || !subjectTitle.trim()} onClick={() => void onCreateSubject()}>
              <Plus className="me-1 h-4 w-4" />
              {t('content.createSubject')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardContent className="space-y-3 pt-5">
          <p className="text-sm font-semibold text-foreground">{t('content.addTopic')}</p>
          <div className="grid gap-2 sm:grid-cols-3">
            <select
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm"
              value={topicSubjectId}
              onChange={(e) => setTopicSubjectId(e.target.value)}
            >
              <option value="">{t('content.chooseSubject')}</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
            <Input
              value={topicTitle}
              onChange={(e) => setTopicTitle(e.target.value)}
              placeholder={t('content.topicTitle')}
            />
            <Button
              disabled={busy || !topicTitle.trim() || !topicSubjectId}
              onClick={() => void onCreateTopic()}
            >
              <Plus className="me-1 h-4 w-4" />
              {t('content.createTopic')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardContent className="space-y-3 pt-5">
          <p className="text-sm font-semibold text-foreground">{t('content.addLesson')}</p>
          <div className="grid gap-2 sm:grid-cols-3">
            <select
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm"
              value={lessonTopicId}
              onChange={(e) => setLessonTopicId(e.target.value)}
            >
              <option value="">{t('content.chooseTopic')}</option>
              {Object.entries(topicsBySubject).flatMap(([, list]) =>
                list.map((tp) => (
                  <option key={tp.id} value={tp.id}>
                    {tp.title}
                  </option>
                ))
              )}
            </select>
            <Input
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              placeholder={t('content.lessonTitle')}
            />
            <Button
              disabled={busy || !lessonTitle.trim() || !lessonTopicId}
              onClick={() => void onCreateLesson()}
            >
              <Plus className="me-1 h-4 w-4" />
              {t('content.createLesson')}
            </Button>
          </div>
          <p className="text-xs text-muted">{t('content.expandToPickTopic')}</p>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : subjects.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">{t('content.noSubjects')}</p>
      ) : (
        <ul className="space-y-2">
          {subjects.map((s) => (
            <li key={s.id} className="rounded-xl border border-border bg-surface">
              <div className="flex items-center gap-2 px-3 py-2">
                <button
                  type="button"
                  className="rounded p-1 hover:bg-surface-subtle"
                  onClick={() => void toggleSubject(s.id)}
                  aria-expanded={!!expandedSubjects[s.id]}
                >
                  {expandedSubjects[s.id] ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                  )}
                </button>
                <Layers className="h-4 w-4 text-primary" />
                <span className="flex-1 text-sm font-semibold">{s.title}</span>
                {s.code && <Badge variant="info">{s.code}</Badge>}
                <Badge variant="secondary">{t('content.subject')}</Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-error"
                  onClick={() => void onDeleteSubject(s.id)}
                  aria-label={t('common.delete')}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              {expandedSubjects[s.id] && (
                <ul className="border-t border-border/60 bg-surface-subtle/40 px-3 py-2 ps-10">
                  {(topicsBySubject[s.id] ?? []).length === 0 ? (
                    <li className="py-2 text-xs text-muted">{t('content.noTopics')}</li>
                  ) : (
                    (topicsBySubject[s.id] ?? []).map((tp) => (
                      <li key={tp.id} className="mb-1 rounded-lg border border-border/50 bg-surface">
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
                          <span className="flex-1 text-sm font-medium">{tp.title}</span>
                          <Badge variant="secondary">{t('content.topic')}</Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-error h-8 w-8"
                            onClick={() => void onDeleteTopic(s.id, tp.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        {expandedTopics[tp.id] && (
                          <ul className="border-t border-border/40 px-2 py-1 ps-8">
                            {(lessonsByTopic[tp.id] ?? []).length === 0 ? (
                              <li className="py-1 text-xs text-muted">{t('content.noLessons')}</li>
                            ) : (
                              (lessonsByTopic[tp.id] ?? []).map((ls) => (
                                <li
                                  key={ls.id}
                                  className="mb-1 flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-surface-subtle"
                                >
                                  <span className="flex-1">{ls.title}</span>
                                  {ls.durationMinutes != null && (
                                    <span className="text-xs text-muted">
                                      {ls.durationMinutes} {t('content.min')}
                                    </span>
                                  )}
                                  <Badge variant="secondary">{t('content.lesson')}</Badge>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-error h-7 w-7"
                                    onClick={() => void onDeleteLesson(tp.id, ls.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
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
  )
}
