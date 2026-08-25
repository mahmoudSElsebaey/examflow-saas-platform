import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/components/ui/Toast'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { BookOpen, Library, Plus, HelpCircle, Trash2, Layers, Search } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import * as contentApi from '../api/contentApi'
import * as orgApi from '@/features/organizations/api/orgApi'
import type { Course, Question, QuestionBank, QuestionType } from '../types'
import type { Organization } from '@/features/organizations/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/utils'
import { HierarchyPanel } from '../components/HierarchyPanel'
import { OrgWorkspaceLayout } from '@/components/layout/OrgWorkspaceLayout'

type Tab = 'courses' | 'hierarchy' | 'banks' | 'questions'

export function OrgContentPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const { t } = useTranslation()
  const toast = useToast()
  const { accessToken } = useAuth()
  const [org, setOrg] = useState<Organization | null>(null)
  const [tab, setTab] = useState<Tab>('courses')
  const [courses, setCourses] = useState<Course[]>([])
  const [banks, setBanks] = useState<QuestionBank[]>([])
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCourseForm, setShowCourseForm] = useState(false)
  const [showBankForm, setShowBankForm] = useState(false)
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [query, setQuery] = useState('')

  const courseForm = useForm({
    resolver: zodResolver(
      z.object({
        title: z.string().min(2),
        code: z.string().optional(),
        description: z.string().optional(),
      })
    ),
  })
  const bankForm = useForm({
    resolver: zodResolver(
      z.object({
        name: z.string().min(2),
        description: z.string().optional(),
        courseId: z.string().optional(),
      })
    ),
  })
  const questionForm = useForm({
    resolver: zodResolver(
      z.object({
        type: z.enum(['mcq_single', 'mcq_multiple', 'true_false', 'short_answer']),
        stem: z.string().min(1),
        optionA: z.string().optional(),
        optionB: z.string().optional(),
        optionC: z.string().optional(),
        optionD: z.string().optional(),
        correctIndex: z.string().optional(),
        difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
        points: z.number().min(0).max(100).optional(),
      })
    ),
    defaultValues: { type: 'mcq_single' as const, difficulty: 'medium' as const, points: 1 },
  })

  const loadCoursesAndBanks = async () => {
    if (!accessToken || !orgId) return
    setLoading(true)
    setError(null)
    try {
      const [orgRes, cRes, bRes] = await Promise.all([
        orgApi.getOrganizationApi(accessToken, orgId),
        contentApi.listCoursesApi(accessToken, orgId),
        contentApi.listBanksApi(accessToken, orgId),
      ])
      setOrg(orgRes.data?.organization ?? null)
      setCourses(cRes.data?.courses ?? [])
      setBanks(bRes.data?.banks ?? [])
    } catch (err) {
      toast.fromError(err)
      setError(t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  const loadQuestions = async (bankId: string) => {
    if (!accessToken || !orgId) return
    try {
      const res = await contentApi.listQuestionsApi(accessToken, orgId, bankId)
      setQuestions(res.data?.questions ?? [])
    } catch (err) {
      toast.fromError(err)
      setError(t('errors.generic'))
    }
  }

  useEffect(() => {
    void loadCoursesAndBanks()
  }, [accessToken, orgId])

  useEffect(() => {
    if (selectedBankId) void loadQuestions(selectedBankId)
    else setQuestions([])
  }, [selectedBankId, accessToken, orgId])

  const onCreateCourse = async (data: { title: string; code?: string; description?: string }) => {
    if (!accessToken || !orgId) return
    try {
      await contentApi.createCourseApi(accessToken, orgId, data)
      courseForm.reset()
      setShowCourseForm(false)
      toast.success(t('toast.saved'))
      await loadCoursesAndBanks()
    } catch (err) {
      toast.fromError(err)
      setError(t('errors.generic'))
    }
  }

  const onCreateBank = async (data: { name: string; description?: string; courseId?: string }) => {
    if (!accessToken || !orgId) return
    try {
      await contentApi.createBankApi(accessToken, orgId, {
        name: data.name,
        description: data.description,
        courseId: data.courseId || undefined,
      })
      bankForm.reset()
      setShowBankForm(false)
      toast.success(t('toast.saved'))
      await loadCoursesAndBanks()
    } catch (err) {
      toast.fromError(err)
      setError(t('errors.generic'))
    }
  }

  const onCreateQuestion = async (data: {
    type: QuestionType
    stem: string
    optionA?: string
    optionB?: string
    optionC?: string
    optionD?: string
    correctIndex?: string
    difficulty?: 'easy' | 'medium' | 'hard'
    points?: number
  }) => {
    if (!accessToken || !orgId || !selectedBankId) return
    try {
      const type = data.type
      let options: { text: string }[] | undefined
      let correctAnswers: string[] | undefined
      if (type === 'mcq_single' || type === 'mcq_multiple') {
        options = [data.optionA, data.optionB, data.optionC, data.optionD]
          .filter((x): x is string => !!x && x.trim().length > 0)
          .map((text) => ({ text }))
        correctAnswers = [data.correctIndex ?? '0']
      } else if (type === 'true_false') {
        correctAnswers = [data.correctIndex === '1' ? 'false' : 'true']
      }
      await contentApi.createQuestionApi(accessToken, orgId, selectedBankId, {
        type,
        stem: data.stem,
        options,
        correctAnswers,
        difficulty: data.difficulty,
        points: data.points,
      })
      questionForm.reset({ type: 'mcq_single', difficulty: 'medium', points: 1 })
      setShowQuestionForm(false)
      toast.success(t('toast.saved'))
      await loadQuestions(selectedBankId)
      await loadCoursesAndBanks()
    } catch (err) {
      toast.fromError(err)
      setError(t('errors.generic'))
    }
  }

  const onDeleteQuestion = async (id: string) => {
    if (!accessToken || !orgId || !selectedBankId) return
    if (!window.confirm(t('common.delete', { defaultValue: 'Delete' }) + '?')) return
    try {
      await contentApi.deleteQuestionApi(accessToken, orgId, id)
      toast.success(t('toast.saved'))
      await loadQuestions(selectedBankId)
      await loadCoursesAndBanks()
    } catch (err) {
      toast.fromError(err)
      setError(t('errors.generic'))
    }
  }

  const q = query.trim().toLowerCase()
  const filteredCourses = useMemo(
    () =>
      !q
        ? courses
        : courses.filter(
            (c) =>
              c.title.toLowerCase().includes(q) ||
              (c.code || '').toLowerCase().includes(q) ||
              (c.description || '').toLowerCase().includes(q)
          ),
    [courses, q]
  )
  const filteredBanks = useMemo(
    () =>
      !q
        ? banks
        : banks.filter(
            (b) =>
              b.name.toLowerCase().includes(q) || (b.description || '').toLowerCase().includes(q)
          ),
    [banks, q]
  )
  const filteredQuestions = useMemo(
    () => (!q ? questions : questions.filter((x) => x.stem.toLowerCase().includes(q))),
    [questions, q]
  )

  const tabs: { id: Tab; label: string; icon: typeof BookOpen }[] = [
    { id: 'courses', label: t('content.courses'), icon: BookOpen },
    { id: 'hierarchy', label: t('content.hierarchy'), icon: Layers },
    { id: 'banks', label: t('content.banks'), icon: Library },
    { id: 'questions', label: t('content.questions'), icon: HelpCircle },
  ]

  if (!orgId) return null

  return (
    <OrgWorkspaceLayout
      orgId={orgId}
      orgName={org?.name}
      role={org?.myRole}
      branding={org?.branding}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t('content.title')}
        </h1>
        <p className="mt-1 text-muted">{t('content.subtitle')}</p>
      </div>

      {error && (
        <Alert variant="error" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            className="ps-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('common.search', { defaultValue: 'Search…' })}
          />
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 border-b border-border pb-3">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
              tab === id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted hover:bg-surface-subtle hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : (
        <>
          {tab === 'courses' && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <Button className="gap-2" onClick={() => setShowCourseForm((v) => !v)}>
                  <Plus className="h-4 w-4" />
                  {t('content.createCourse')}
                </Button>
              </div>
              {showCourseForm && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{t('content.createCourse')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={courseForm.handleSubmit(onCreateCourse)}
                      className="grid gap-4 sm:grid-cols-2"
                    >
                      <div className="space-y-2 sm:col-span-2">
                        <Label>{t('content.courseTitle')}</Label>
                        <Input {...courseForm.register('title')} />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('content.courseCode')}</Label>
                        <Input {...courseForm.register('code')} />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('content.description')}</Label>
                        <Input {...courseForm.register('description')} />
                      </div>
                      <div className="sm:col-span-2 flex gap-2">
                        <Button type="submit">{t('common.save')}</Button>
                        <Button type="button" variant="ghost" onClick={() => setShowCourseForm(false)}>
                          {t('common.cancel')}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCourses.map((c) => (
                  <Card key={c.id} className="border-border/60">
                    <CardContent className="pt-6">
                      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-muted text-primary">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <h3 className="font-semibold text-foreground">{c.title}</h3>
                      {c.code && <p className="mt-1 text-xs font-medium text-primary">{c.code}</p>}
                      {c.description && (
                        <p className="mt-2 line-clamp-2 text-sm text-muted">{c.description}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {filteredCourses.length === 0 && (
                  <p className="text-sm text-muted sm:col-span-3">{t('content.noCourses')}</p>
                )}
              </div>
            </div>
          )}

          {tab === 'hierarchy' && accessToken && (
            <HierarchyPanel orgId={orgId} accessToken={accessToken} courses={courses} />
          )}

          {tab === 'banks' && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <Button className="gap-2" onClick={() => setShowBankForm((v) => !v)}>
                  <Plus className="h-4 w-4" />
                  {t('content.createBank', { defaultValue: 'Create bank' })}
                </Button>
              </div>
              {showBankForm && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {t('content.createBank', { defaultValue: 'Create bank' })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={bankForm.handleSubmit(onCreateBank)}
                      className="grid gap-4 sm:grid-cols-2"
                    >
                      <div className="space-y-2 sm:col-span-2">
                        <Label>{t('content.bankName', { defaultValue: 'Bank name' })}</Label>
                        <Input {...bankForm.register('name')} />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('content.linkedCourse', { defaultValue: 'Course' })}</Label>
                        <select
                          className="flex h-11 w-full rounded-lg border border-border bg-surface px-3.5 text-sm"
                          {...bankForm.register('courseId')}
                        >
                          <option value="">{t('content.noCourse', { defaultValue: 'None' })}</option>
                          {courses.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t('content.description')}</Label>
                        <Input {...bankForm.register('description')} />
                      </div>
                      <div className="sm:col-span-2 flex gap-2">
                        <Button type="submit">{t('common.save')}</Button>
                        <Button type="button" variant="ghost" onClick={() => setShowBankForm(false)}>
                          {t('common.cancel')}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredBanks.map((b) => (
                  <Card
                    key={b.id}
                    className={cn(
                      'cursor-pointer border-border/60 transition-shadow hover:shadow-md',
                      selectedBankId === b.id && 'ring-2 ring-primary/40'
                    )}
                    onClick={() => {
                      setSelectedBankId(b.id)
                      setTab('questions')
                    }}
                  >
                    <CardContent className="pt-6">
                      <div className="mb-2 flex items-start justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-muted text-primary">
                          <Library className="h-5 w-5" />
                        </div>
                        <Badge variant="info">
                          {b.questionCount} {t('content.qCount', { defaultValue: 'questions' })}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-foreground">{b.name}</h3>
                      {b.description && (
                        <p className="mt-2 line-clamp-2 text-sm text-muted">{b.description}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {filteredBanks.length === 0 && (
                  <p className="text-sm text-muted sm:col-span-3">
                    {t('content.noBanks', { defaultValue: 'No banks yet.' })}
                  </p>
                )}
              </div>
            </div>
          )}

          {tab === 'questions' && (
            <div className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <Label>{t('content.selectBank', { defaultValue: 'Select bank' })}</Label>
                  <select
                    className="flex h-11 w-full min-w-[220px] rounded-lg border border-border bg-surface px-3.5 text-sm sm:w-auto"
                    value={selectedBankId ?? ''}
                    onChange={(e) => setSelectedBankId(e.target.value || null)}
                  >
                    <option value="">{t('content.chooseBank', { defaultValue: 'Choose…' })}</option>
                    {banks.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.questionCount})
                      </option>
                    ))}
                  </select>
                </div>
                {selectedBankId && (
                  <Button className="gap-2 self-start" onClick={() => setShowQuestionForm((v) => !v)}>
                    <Plus className="h-4 w-4" />
                    {t('content.createQuestion', { defaultValue: 'Add question' })}
                  </Button>
                )}
              </div>

              {showQuestionForm && selectedBankId && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {t('content.createQuestion', { defaultValue: 'Add question' })}
                    </CardTitle>
                    <CardDescription>
                      {t('content.questionHint', { defaultValue: 'MCQ, T/F, or short answer' })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={questionForm.handleSubmit(onCreateQuestion)}
                      className="space-y-4"
                    >
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                          <Label>{t('content.qType', { defaultValue: 'Type' })}</Label>
                          <select
                            className="flex h-11 w-full rounded-lg border border-border bg-surface px-3.5 text-sm"
                            {...questionForm.register('type')}
                          >
                            <option value="mcq_single">MCQ single</option>
                            <option value="mcq_multiple">MCQ multiple</option>
                            <option value="true_false">True / False</option>
                            <option value="short_answer">Short answer</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label>{t('content.difficulty', { defaultValue: 'Difficulty' })}</Label>
                          <select
                            className="flex h-11 w-full rounded-lg border border-border bg-surface px-3.5 text-sm"
                            {...questionForm.register('difficulty')}
                          >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label>{t('content.points', { defaultValue: 'Points' })}</Label>
                          <Input
                            type="number"
                            {...questionForm.register('points', { valueAsNumber: true })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>{t('content.stem', { defaultValue: 'Question' })}</Label>
                        <Input {...questionForm.register('stem')} />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input placeholder="A" {...questionForm.register('optionA')} />
                        <Input placeholder="B" {...questionForm.register('optionB')} />
                        <Input placeholder="C" {...questionForm.register('optionC')} />
                        <Input placeholder="D" {...questionForm.register('optionD')} />
                      </div>
                      <div className="space-y-2">
                        <Label>
                          {t('content.correctIndex', { defaultValue: 'Correct option index (0–3)' })}
                        </Label>
                        <Input placeholder="0" {...questionForm.register('correctIndex')} />
                      </div>
                      <div className="flex gap-2">
                        <Button type="submit">{t('common.save')}</Button>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setShowQuestionForm(false)}
                        >
                          {t('common.cancel')}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {!selectedBankId ? (
                <p className="text-sm text-muted">
                  {t('content.pickBankFirst', { defaultValue: 'Select a bank first.' })}
                </p>
              ) : (
                <ul className="space-y-3">
                  {filteredQuestions.map((qItem) => (
                    <Card key={qItem.id} className="border-border/60">
                      <CardContent className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex flex-wrap gap-2">
                            <Badge variant="info">{qItem.type}</Badge>
                            <Badge variant="warning">{qItem.difficulty}</Badge>
                            <Badge variant="success">
                              {qItem.points} {t('content.pts', { defaultValue: 'pts' })}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-foreground">{qItem.stem}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-error"
                          onClick={() => void onDeleteQuestion(qItem.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {t('common.delete', { defaultValue: 'Delete' })}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                  {filteredQuestions.length === 0 && (
                    <p className="text-sm text-muted">
                      {t('content.noQuestions', { defaultValue: 'No questions.' })}
                    </p>
                  )}
                </ul>
              )}
            </div>
          )}
        </>
      )}
    </OrgWorkspaceLayout>
  )
}
