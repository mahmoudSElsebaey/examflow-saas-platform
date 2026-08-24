import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/components/ui/Toast'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, BookOpen, Library, Plus, HelpCircle, Trash2, Layers } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import * as contentApi from '../api/contentApi'
import type { Course, Question, QuestionBank, QuestionType } from '../types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Container } from '@/components/ui/Container'
import { Spinner } from '@/components/ui/Spinner'
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'
import { appConfig } from '@/config/app'
import { cn } from '@/lib/utils'
import { HierarchyPanel } from '../components/HierarchyPanel'

type Tab = 'courses' | 'hierarchy' | 'banks' | 'questions'

export function OrgContentPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const { t } = useTranslation()
  const toast = useToast()
  const { accessToken, logout, user } = useAuth()
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
      const [cRes, bRes] = await Promise.all([
        contentApi.listCoursesApi(accessToken, orgId),
        contentApi.listBanksApi(accessToken, orgId),
      ])
      setCourses(cRes.data?.courses ?? [])
      setBanks(bRes.data?.banks ?? [])
    } catch (err) {
      toast.fromError(err); setError(t('errors.generic'))
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
      toast.fromError(err); setError(t('errors.generic'))
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
      await loadCoursesAndBanks()
    } catch (err) {
      toast.fromError(err); setError(t('errors.generic'))
    }
  }

  const onCreateBank = async (data: {
    name: string
    description?: string
    courseId?: string
  }) => {
    if (!accessToken || !orgId) return
    try {
      await contentApi.createBankApi(accessToken, orgId, {
        name: data.name,
        description: data.description,
        courseId: data.courseId || undefined,
      })
      bankForm.reset()
      setShowBankForm(false)
      await loadCoursesAndBanks()
    } catch (err) {
      toast.fromError(err); setError(t('errors.generic'))
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
      await loadQuestions(selectedBankId)
      await loadCoursesAndBanks()
    } catch (err) {
      toast.fromError(err); setError(t('errors.generic'))
    }
  }

  const onDeleteQuestion = async (id: string) => {
    if (!accessToken || !orgId || !selectedBankId) return
    try {
      await contentApi.deleteQuestionApi(accessToken, orgId, id)
      await loadQuestions(selectedBankId)
      await loadCoursesAndBanks()
    } catch (err) {
      toast.fromError(err); setError(t('errors.generic'))
    }
  }

  const tabs: { id: Tab; label: string; icon: typeof BookOpen }[] = [
    { id: 'courses', label: t('content.courses'), icon: BookOpen },
    { id: 'hierarchy', label: t('content.hierarchy'), icon: Layers },
    { id: 'banks', label: t('content.banks'), icon: Library },
    { id: 'questions', label: t('content.questions'), icon: HelpCircle },
  ]

  return (
    <div className="min-h-screen bg-mesh">
      <header className="sticky top-0 z-40 border-b border-border/50 glass">
        <Container>
          <div className="flex h-14 items-center justify-between gap-3">
            <Link to="/app" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-800 text-xs font-bold text-primary-foreground">
                EF
              </span>
              <span className="font-bold text-foreground">{appConfig.APP_NAME}</span>
            </Link>
            <div className="flex items-center gap-3">
              <LanguageSwitcher variant="compact" />
              <span className="hidden text-sm text-muted sm:inline">{user?.firstName}</span>
              <Button variant="outline" size="sm" onClick={() => logout()}>
                {t('common.logOut')}
              </Button>
            </div>
          </div>
        </Container>
      </header>

      <Container className="py-10">
        <Link
          to={`/app/organizations/${orgId}`}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t('content.backToOrg')}
        </Link>

        <div className="mb-8">
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
                  {courses.map((c) => (
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
                  {courses.length === 0 && (
                    <p className="text-sm text-muted sm:col-span-3">{t('content.noCourses')}</p>
                  )}
                </div>
              </div>
            )}

            {tab === 'hierarchy' && orgId && accessToken && (
              <HierarchyPanel orgId={orgId} accessToken={accessToken} courses={courses} />
            )}

            {tab === 'banks' && (
              <div className="space-y-6">
                <div className="flex justify-end">
                  <Button className="gap-2" onClick={() => setShowBankForm((v) => !v)}>
                    <Plus className="h-4 w-4" />
                    {t('content.createBank')}
                  </Button>
                </div>
                {showBankForm && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">{t('content.createBank')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form
                        onSubmit={bankForm.handleSubmit(onCreateBank)}
                        className="grid gap-4 sm:grid-cols-2"
                      >
                        <div className="space-y-2 sm:col-span-2">
                          <Label>{t('content.bankName')}</Label>
                          <Input {...bankForm.register('name')} />
                        </div>
                        <div className="space-y-2">
                          <Label>{t('content.linkedCourse')}</Label>
                          <select
                            className="flex h-11 w-full rounded-lg border border-border bg-surface px-3.5 text-sm"
                            {...bankForm.register('courseId')}
                          >
                            <option value="">{t('content.noCourse')}</option>
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
                  {banks.map((b) => (
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
                            {b.questionCount} {t('content.qCount')}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-foreground">{b.name}</h3>
                        {b.description && (
                          <p className="mt-2 line-clamp-2 text-sm text-muted">{b.description}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {banks.length === 0 && (
                    <p className="text-sm text-muted sm:col-span-3">{t('content.noBanks')}</p>
                  )}
                </div>
              </div>
            )}

            {tab === 'questions' && (
              <div className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <Label>{t('content.selectBank')}</Label>
                    <select
                      className="flex h-11 w-full min-w-[220px] rounded-lg border border-border bg-surface px-3.5 text-sm sm:w-auto"
                      value={selectedBankId ?? ''}
                      onChange={(e) => setSelectedBankId(e.target.value || null)}
                    >
                      <option value="">{t('content.chooseBank')}</option>
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
                      {t('content.createQuestion')}
                    </Button>
                  )}
                </div>

                {showQuestionForm && selectedBankId && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">{t('content.createQuestion')}</CardTitle>
                      <CardDescription>{t('content.questionHint')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form
                        onSubmit={questionForm.handleSubmit(onCreateQuestion)}
                        className="space-y-4"
                      >
                        <div className="grid gap-4 sm:grid-cols-3">
                          <div className="space-y-2">
                            <Label>{t('content.qType')}</Label>
                            <select
                              className="flex h-11 w-full rounded-lg border border-border bg-surface px-3.5 text-sm"
                              {...questionForm.register('type')}
                            >
                              <option value="mcq_single">{t('qTypes.mcq_single')}</option>
                              <option value="mcq_multiple">{t('qTypes.mcq_multiple')}</option>
                              <option value="true_false">{t('qTypes.true_false')}</option>
                              <option value="short_answer">{t('qTypes.short_answer')}</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label>{t('content.difficulty')}</Label>
                            <select
                              className="flex h-11 w-full rounded-lg border border-border bg-surface px-3.5 text-sm"
                              {...questionForm.register('difficulty')}
                            >
                              <option value="easy">{t('difficulty.easy')}</option>
                              <option value="medium">{t('difficulty.medium')}</option>
                              <option value="hard">{t('difficulty.hard')}</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label>{t('content.points')}</Label>
                            <Input
                              type="number"
                              {...questionForm.register('points', { valueAsNumber: true })}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>{t('content.stem')}</Label>
                          <Input {...questionForm.register('stem')} />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Input placeholder={t('content.optionA')} {...questionForm.register('optionA')} />
                          <Input placeholder={t('content.optionB')} {...questionForm.register('optionB')} />
                          <Input placeholder={t('content.optionC')} {...questionForm.register('optionC')} />
                          <Input placeholder={t('content.optionD')} {...questionForm.register('optionD')} />
                        </div>
                        <div className="space-y-2">
                          <Label>{t('content.correctIndex')}</Label>
                          <Input placeholder="0" {...questionForm.register('correctIndex')} />
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit">{t('common.save')}</Button>
                          <Button type="button" variant="ghost" onClick={() => setShowQuestionForm(false)}>
                            {t('common.cancel')}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}

                {!selectedBankId ? (
                  <p className="text-sm text-muted">{t('content.pickBankFirst')}</p>
                ) : (
                  <ul className="space-y-3">
                    {questions.map((q) => (
                      <Card key={q.id} className="border-border/60">
                        <CardContent className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="mb-2 flex flex-wrap gap-2">
                              <Badge variant="info">{q.type}</Badge>
                              <Badge variant="warning">{q.difficulty}</Badge>
                              <Badge variant="success">
                                {q.points} {t('content.pts')}
                              </Badge>
                            </div>
                            <p className="text-sm font-medium text-foreground">{q.stem}</p>
                            {q.options.length > 0 && (
                              <ul className="mt-2 space-y-1 text-sm text-muted">
                                {q.options.map((o) => (
                                  <li key={o.id}>
                                    <span
                                      className={
                                        q.correctAnswers.includes(o.id)
                                          ? 'font-semibold text-success'
                                          : ''
                                      }
                                    >
                                      • {o.text}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-error shrink-0"
                            onClick={() => onDeleteQuestion(q.id)}
                            aria-label={t('common.delete')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                    {questions.length === 0 && (
                      <p className="text-sm text-muted">{t('content.noQuestions')}</p>
                    )}
                  </ul>
                )}
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  )
}
