import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/components/ui/Toast'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Building2, Plus, ArrowRight } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import * as orgApi from '../api/orgApi'
import type { Organization } from '../types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Container } from '@/components/ui/Container'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'
import { appConfig } from '@/config/app'

export function OrganizationsPage() {
  const { t } = useTranslation()
  const toast = useToast()
  const { accessToken, logout, user } = useAuth()
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const schema = z.object({
    name: z.string().min(2, t('org.validation.nameMin')),
    slug: z
      .string()
      .optional()
      .refine(
        (v) => !v || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v),
        t('org.validation.slugFormat')
      ),
    description: z.string().max(500).optional(),
  })

  type FormData = z.infer<typeof schema>

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const load = async () => {
    if (!accessToken) return
    setLoading(true)
    setError(null)
    try {
      const res = await orgApi.listOrganizationsApi(accessToken)
      setOrgs(res.data?.organizations ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [accessToken])

  const onCreate = async (data: FormData) => {
    if (!accessToken) return
    setError(null)
    try {
      await orgApi.createOrganizationApi(accessToken, {
        name: data.name,
        slug: data.slug || undefined,
        description: data.description,
      })
      reset()
      setShowCreate(false)
      toast.success(t('toast.created'))
      await load()
    } catch (err) {
      toast.fromError(err)
      setError(t('errors.generic'))
    }
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
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {t('org.title')}
            </h1>
            <p className="mt-1 text-muted">{t('org.subtitle')}</p>
          </div>
          <Button className="gap-2 self-start" onClick={() => setShowCreate((v) => !v)}>
            <Plus className="h-4 w-4" />
            {t('org.create')}
          </Button>
        </div>

        {error && (
          <Alert variant="error" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {showCreate && (
          <Card className="mb-8 border-primary/20">
            <CardHeader>
              <CardTitle>{t('org.createTitle')}</CardTitle>
              <CardDescription>{t('org.createHint')}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onCreate)} className="space-y-4" noValidate>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('org.name')}</Label>
                    <Input id="name" error={!!errors.name} {...register('name')} />
                    {errors.name && (
                      <p className="text-xs text-error">{errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">{t('org.slug')}</Label>
                    <Input
                      id="slug"
                      placeholder="my-academy"
                      error={!!errors.slug}
                      {...register('slug')}
                    />
                    {errors.slug && (
                      <p className="text-xs text-error">{errors.slug.message}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">{t('org.description')}</Label>
                  <Input id="description" {...register('description')} />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? t('common.loading') : t('org.create')}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>
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
        ) : orgs.length === 0 ? (
          <EmptyState
            title={t('org.emptyTitle')}
            description={t('org.emptyBody')}
            action={
              <Button className="gap-2" onClick={() => setShowCreate(true)}>
                <Plus className="h-4 w-4" />
                {t('org.create')}
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {orgs.map((org) => (
              <Link key={org.id} to={`/app/organizations/${org.id}`}>
                <Card className="card-interactive h-full border-border/60">
                  <CardContent className="pt-6">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-muted text-primary">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <Badge variant="info">{org.myRole ?? org.plan}</Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">{org.name}</h3>
                    <p className="mt-1 text-sm text-muted">/{org.slug}</p>
                    {org.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-muted">{org.description}</p>
                    )}
                    <p className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                      {t('org.open')}
                      <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </div>
  )
}
