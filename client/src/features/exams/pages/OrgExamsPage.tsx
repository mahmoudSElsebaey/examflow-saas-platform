import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { ClipboardList, Plus, Play, Send } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import * as examApi from '../api/examApi'
import * as contentApi from '@/features/content/api/contentApi'
import * as orgApi from '@/features/organizations/api/orgApi'
import type { Exam } from '../types'
import type { Question } from '@/features/content/types'
import type { OrgMemberRole, Organization } from '@/features/organizations/types'
import { isStaffRole } from '@/features/organizations/lib/roles'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { OrgWorkspaceLayout } from '@/components/layout/OrgWorkspaceLayout'

export function OrgExamsPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const { t } = useTranslation()
  const { accessToken } = useAuth()
  const navigate = useNavigate()

  const [org, setOrg] = useState<Organization | null>(null)
  const [role, setRole] = useState<OrgMemberRole | null>(null)
  const [exams, setExams] = useState<Exam[]>([])
  const [available, setAvailable] = useState<Exam[]>([])
  const [allQuestions, setAllQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedQ, setSelectedQ] = useState<string[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)

  const isStaff = isStaffRole(role)

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
      const orgRes = await orgApi.getOrganizationApi(accessToken, orgId)
      const organization = orgRes.data?.organization ?? null
      setOrg(organization)
      const myRole = organization?.myRole ?? null
      setRole(myRole)

      if (isStaffRole(myRole)) {
        const examsRes = await examApi.listExamsApi(accessToken, orgId)
        setExams(examsRes.data?.exams ?? [])
        const banksRes = await contentApi.listBanksApi(accessToken, orgId)
        const banks = banksRes.data?.banks ?? []
        const qLists = await Promise.all(
          banks.map((b) => contentApi.listQuestionsApi(accessToken, orgId, b.id))
        )
        setAllQuestions(qLists.flatMap((r) => r.data?.questions ?? []))
      } else {
        const availRes = await examApi.listAvailableExamsApi(accessToken, orgId)
        setAvailable(availRes.data?.exams ?? [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [accessToken, orgId])

  const onSubmit = form.handleSubmit(async (data) => {
    if (!accessToken || !orgId || !isStaff) return
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
  })

  const onPublish = async (examId: string) => {
    if (!accessToken || !orgId || !isStaff) return
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
    <OrgWorkspaceLayout
      orgId={orgId!}
      orgName={org?.name}
      role={role}
      branding={org?.branding}
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {isStaff ? t('exam.title') : t('exam.availableTitle')}
          </h1>
          <p className="mt-1 text-muted">
            {isStaff ? t('exam.subtitle') : t('exam.availableSubtitle')}
          </p>
        </div>
        {isStaff && (
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
        )}
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
      ) : isStaff ? (
        <>
          {showForm && (
            <Card className="mb-8 border-primary/20">
              <CardHeader>
                <CardTitle>{editingId ? t('exam.edit') : t('exam.create')}</CardTitle>
                <CardDescription>{t('exam.createHint')}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={onSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">{t('exam.examTitle')}</Label>
                    <Input id="title" {...form.register('title')} />
                  </div>
                  <div>
                    <Label htmlFor="description">{t('exam.description')}</Label>
                    <Input id="description" {...form.register('description')} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <Label htmlFor="timeLimitMinutes">{t('exam.timeLimit')}</Label>
                      <Input
                        id="timeLimitMinutes"
                        type="number"
                        {...form.register('timeLimitMinutes', { valueAsNumber: true })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="passingScorePercent">{t('exam.passingScore')}</Label>
                      <Input
                        id="passingScorePercent"
                        type="number"
                        {...form.register('passingScorePercent', { valueAsNumber: true })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxAttempts">{t('exam.maxAttempts')}</Label>
                      <Input
                        id="maxAttempts"
                        type="number"
                        {...form.register('maxAttempts', { valueAsNumber: true })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>{t('exam.selectQuestions')}</Label>
                    <p className="mb-2 text-xs text-muted">
                      {t('exam.selectedCount', { count: selectedQ.length })}
                    </p>
                    {allQuestions.length === 0 ? (
                      <p className="text-sm text-muted">{t('exam.noQuestions')}</p>
                    ) : (
                      <ul className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-border p-2">
                        {allQuestions.map((q) => (
                          <li key={q.id}>
                            <label className="flex cursor-pointer items-start gap-2 rounded px-2 py-1.5 text-sm hover:bg-surface-subtle">
                              <input
                                type="checkbox"
                                checked={selectedQ.includes(q.id)}
                                onChange={() => toggleQ(q.id)}
                                className="mt-0.5"
                              />
                              <span className="min-w-0 flex-1">
                                <span className="line-clamp-2">{q.stem}</span>
                                <span className="ms-1 text-xs text-muted">
                                  ({q.points} {t('exam.pts')})
                                </span>
                              </span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button type="submit">{editingId ? t('common.save') : t('exam.create')}</Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false)
                        setEditingId(null)
                      }}
                    >
                      {t('common.cancel')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {exams.map((exam) => (
              <Card key={exam.id} className="border-border/60">
                <CardContent className="pt-5">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-foreground">{exam.title}</h3>
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
                  {exam.description && (
                    <p className="mb-2 line-clamp-2 text-sm text-muted">{exam.description}</p>
                  )}
                  <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted">
                    <span>
                      {exam.questionCount ?? exam.questionIds?.length ?? 0} {t('exam.questions')}
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
                        disabled={(exam.questionCount ?? exam.questionIds?.length ?? 0) === 0}
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
                        setSelectedQ(exam.questionIds ?? [])
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
              <div className="sm:col-span-2 lg:col-span-3">
                <EmptyState
                  icon={<ClipboardList className="h-6 w-6" />}
                  title={t('exam.empty')}
                  description={t('exam.emptyHint')}
                />
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {available.map((exam) => (
            <Card key={exam.id} className="border-border/60">
              <CardContent className="pt-5">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-foreground">{exam.title}</h3>
                  <Badge variant="success">{t('exam.statusAvailable')}</Badge>
                </div>
                {exam.description && (
                  <p className="mb-2 line-clamp-2 text-sm text-muted">{exam.description}</p>
                )}
                <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted">
                  <span>
                    {exam.questionCount ?? exam.questionIds?.length ?? 0} {t('exam.questions')}
                  </span>
                  {exam.timeLimitMinutes != null && (
                    <>
                      <span>·</span>
                      <span>
                        {exam.timeLimitMinutes} {t('exam.min')}
                      </span>
                    </>
                  )}
                  <span>·</span>
                  <span>
                    {t('exam.passingScore')}: {exam.passingScorePercent}%
                  </span>
                </div>
                <div className="mt-4">
                  <Button size="sm" className="gap-1" onClick={() => onStart(exam.id)}>
                    <Play className="h-3.5 w-3.5" />
                    {t('exam.start')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {available.length === 0 && (
            <div className="sm:col-span-2 lg:col-span-3">
              <EmptyState
                icon={<ClipboardList className="h-6 w-6" />}
                title={t('exam.noAvailable')}
                description={t('exam.noAvailableHint')}
              />
            </div>
          )}
        </div>
      )}
    </OrgWorkspaceLayout>
  )
}
