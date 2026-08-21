import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, ClipboardList, Plus, Play, Send } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import * as examApi from '../api/examApi'
import * as contentApi from '@/features/content/api/contentApi'
import type { Exam } from '../types'
import type { Question } from '@/features/content/types'
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

export function OrgExamsPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const { t } = useTranslation()
  const { accessToken, logout, user } = useAuth()
  const navigate = useNavigate()

  const [exams, setExams] = useState<Exam[]>([])
  const [allQuestions, setAllQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedQ, setSelectedQ] = useState<string[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)

  const form = useForm({
    resolver: zodResolver(
      z.object({
        title: z.string().min(2),
        description: z.string().optional(),
        timeLimitMinutes: z.number().min(1).max(600).optional().nullable(),
        passingScorePercent: z.number().min(0).max(100).optional(),
        maxAttempts: z.number().min(1).max(20).optional(),
      })
    ),
    defaultValues: {
      title: '',
      description: '',
      timeLimitMinutes: 30 as number | null,
      passingScorePercent: 50,
      maxAttempts: 1,
    },
  })

  const load = async () => {
    if (!accessToken || !orgId) return
    setLoading(true)
    setError(null)
    try {
      const examsRes = await examApi.listExamsApi(accessToken, orgId)
      setExams(examsRes.data?.exams ?? [])
      const banksRes = await contentApi.listBanksApi(accessToken, orgId)
      const banks = banksRes.data?.banks ?? []
      const qLists = await Promise.all(
        banks.map((b) => contentApi.listQuestionsApi(accessToken, orgId, b.id))
      )
      setAllQuestions(qLists.flatMap((r) => r.data?.questions ?? []))
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [accessToken, orgId])

  const onCreate = async (data: {
    title: string
    description?: string
    timeLimitMinutes?: number | null
    passingScorePercent?: number
    maxAttempts?: number
  }) => {
    if (!accessToken || !orgId) return
    try {
      if (editingId) {
        await examApi.updateExamApi(accessToken, orgId, editingId, {
          ...data,
          questionIds: selectedQ,
        })
      } else {
        await examApi.createExamApi(accessToken, orgId, {
          ...data,
          questionIds: selectedQ,
        })
      }
      form.reset()
      setSelectedQ([])
      setShowForm(false)
      setEditingId(null)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.generic'))
    }
  }

  const onPublish = async (examId: string) => {
    if (!accessToken || !orgId) return
    try {
      await examApi.publishExamApi(accessToken, orgId, examId)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.generic'))
    }
  }

  const onStart = async (examId: string) => {
    if (!accessToken || !orgId) return
    try {
      const res = await examApi.startAttemptApi(accessToken, orgId, examId)
      const id = res.data?.attempt?.id
      if (id) navigate(`/app/organizations/${orgId}/attempts/${id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.generic'))
    }
  }

  const toggleQ = (id: string) => {
    setSelectedQ((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

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
          {t('exam.backToOrg')}
        </Link>

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {t('exam.title')}
            </h1>
            <p className="mt-1 text-muted">{t('exam.subtitle')}</p>
          </div>
          <Button
            className="gap-2 self-start"
            onClick={() => {
              setShowForm((v) => !v)
              setEditingId(null)
              setSelectedQ([])
              form.reset()
            }}
          >
            <Plus className="h-4 w-4" />
            {t('exam.create')}
          </Button>
        </div>

        {error && (
          <Alert variant="error" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {showForm && (
          <Card className="mb-8 border-primary/20">
            <CardHeader>
              <CardTitle>{editingId ? t('exam.edit') : t('exam.create')}</CardTitle>
              <CardDescription>{t('exam.createHint')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onCreate)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label>{t('exam.examTitle')}</Label>
                    <Input {...form.register('title')} />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label>{t('exam.description')}</Label>
                    <Input {...form.register('description')} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('exam.timeLimit')}</Label>
                    <Input
                      type="number"
                      {...form.register('timeLimitMinutes', { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('exam.passingScore')}</Label>
                    <Input
                      type="number"
                      {...form.register('passingScorePercent', { valueAsNumber: true })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('exam.maxAttempts')}</Label>
                    <Input
                      type="number"
                      {...form.register('maxAttempts', { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">{t('exam.selectQuestions')}</Label>
                  <div className="max-h-56 space-y-2 overflow-y-auto rounded-lg border border-border p-3">
                    {allQuestions.length === 0 ? (
                      <p className="text-sm text-muted">{t('exam.noQuestions')}</p>
                    ) : (
                      allQuestions.map((q) => (
                        <label
                          key={q.id}
                          className="flex cursor-pointer items-start gap-2 rounded-md p-2 hover:bg-surface-subtle"
                        >
                          <input
                            type="checkbox"
                            checked={selectedQ.includes(q.id)}
                            onChange={() => toggleQ(q.id)}
                            className="mt-1"
                          />
                          <span className="text-sm text-foreground">
                            <Badge variant="info" className="me-2">
                              {q.type}
                            </Badge>
                            {q.stem.slice(0, 120)}
                            {q.stem.length > 120 ? '…' : ''}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {t('exam.selectedCount', { count: selectedQ.length })}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button type="submit">{t('common.save')}</Button>
                  <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                    {t('common.cancel')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {exams.map((exam) => (
              <Card key={exam.id} className="border-border/60">
                <CardContent className="pt-6">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-muted text-primary">
                      <ClipboardList className="h-5 w-5" />
                    </div>
                    <Badge
                      variant={
                        exam.status === 'published'
                          ? 'success'
                          : exam.status === 'draft'
                            ? 'warning'
                            : 'info'
                      }
                    >
                      {exam.status}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-foreground">{exam.title}</h3>
                  {exam.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted">{exam.description}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
                    <span>
                      {exam.questionCount} {t('exam.questions')}
                    </span>
                    <span>·</span>
                    <span>
                      {exam.totalPoints} {t('exam.points')}
                    </span>
                    {exam.timeLimitMinutes != null && (
                      <>
                        <span>·</span>
                        <span>
                          {exam.timeLimitMinutes} {t('exam.min')}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {exam.status === 'draft' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => onPublish(exam.id)}
                        disabled={exam.questionCount === 0}
                      >
                        <Send className="h-3.5 w-3.5" />
                        {t('exam.publish')}
                      </Button>
                    )}
                    {exam.status === 'published' && (
                      <Button size="sm" className="gap-1" onClick={() => onStart(exam.id)}>
                        <Play className="h-3.5 w-3.5" />
                        {t('exam.start')}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(exam.id)
                        setSelectedQ(exam.questionIds)
                        form.reset({
                          title: exam.title,
                          description: exam.description ?? '',
                          timeLimitMinutes: exam.timeLimitMinutes ?? null,
                          passingScorePercent: exam.passingScorePercent,
                          maxAttempts: exam.maxAttempts,
                        })
                        setShowForm(true)
                      }}
                    >
                      {t('common.edit')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {exams.length === 0 && (
              <p className="text-sm text-muted sm:col-span-3">{t('exam.empty')}</p>
            )}
          </div>
        )}
      </Container>
    </div>
  )
}
