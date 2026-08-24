import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  BookOpen,
  ClipboardList,
  Library,
  Search,
  User,
  type LucideIcon,
} from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import {
  searchOrgApi,
  type SearchHit,
  type SearchResultType,
} from '../api/searchApi'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Container } from '@/components/ui/Container'
import { Spinner } from '@/components/ui/Spinner'
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'
import { OrgSubNav } from '@/components/layout/OrgSubNav'
import { appConfig } from '@/config/app'
import { cn } from '@/lib/utils'

const TYPE_FILTERS: { id: SearchResultType | 'all'; labelKey: string }[] = [
  { id: 'all', labelKey: 'search.all' },
  { id: 'exam', labelKey: 'search.exams' },
  { id: 'question', labelKey: 'search.questions' },
  { id: 'course', labelKey: 'search.courses' },
  { id: 'bank', labelKey: 'search.banks' },
  { id: 'member', labelKey: 'search.members' },
]

const ICONS: Record<SearchResultType, LucideIcon> = {
  exam: ClipboardList,
  question: Library,
  course: BookOpen,
  bank: Library,
  member: User,
}

function hrefFor(orgId: string, hit: SearchHit): string {
  const base = `/app/organizations/${orgId}`
  switch (hit.type) {
    case 'exam':
      return `${base}/exams`
    case 'question':
    case 'course':
    case 'bank':
      return `${base}/content`
    case 'member':
      return `${base}/members`
    default:
      return base
  }
}

export function OrgSearchPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const [params, setParams] = useSearchParams()
  const { t } = useTranslation()
  const { accessToken, logout, user } = useAuth()

  const initialQ = params.get('q') || ''
  const [q, setQ] = useState(initialQ)
  const [typeFilter, setTypeFilter] = useState<SearchResultType | 'all'>('all')
  const [hits, setHits] = useState<SearchHit[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  const typesParam = useMemo(
    () => (typeFilter === 'all' ? undefined : [typeFilter]),
    [typeFilter]
  )

  useEffect(() => {
    if (!accessToken || !orgId) return
    const query = (params.get('q') || '').trim()
    if (!query) {
      setHits([])
      setSearched(false)
      return
    }
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      setSearched(true)
      try {
        const res = await searchOrgApi(accessToken, orgId, query, typesParam)
        if (!cancelled) setHits(res.data?.search?.hits ?? [])
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : t('errors.generic'))
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [accessToken, orgId, params, typesParam, t])

  const runSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    const next = q.trim()
    const sp = new URLSearchParams()
    if (next) sp.set('q', next)
    setParams(sp)
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
        <OrgSubNav />

        <Link
          to={`/app/organizations/${orgId}`}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t('search.back', { defaultValue: 'Back to organization' })}
        </Link>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-muted text-primary">
            <Search className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {t('search.title', { defaultValue: 'Search' })}
            </h1>
            <p className="text-sm text-muted">
              {t('search.subtitle', {
                defaultValue: 'Find exams, questions, courses, banks, and members',
              })}
            </p>
          </div>
        </div>

        <form onSubmit={runSearch} className="mb-4 flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t('search.placeholder', {
              defaultValue: 'Type at least one character…',
            })}
            className="w-full flex-1 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            autoFocus
          />
          <Button type="submit" disabled={loading}>
            {loading ? t('common.loading') : t('search.action', { defaultValue: 'Search' })}
          </Button>
        </form>

        <div className="mb-6 flex flex-wrap gap-1.5">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setTypeFilter(f.id)}
              className={cn(
                'rounded-lg px-3 py-1 text-xs font-medium transition-colors',
                typeFilter === f.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-surface-subtle text-muted hover:text-foreground'
              )}
            >
              {t(f.labelKey, {
                defaultValue:
                  f.id === 'all'
                    ? 'All'
                    : f.id.charAt(0).toUpperCase() + f.id.slice(1) + 's',
              })}
            </button>
          ))}
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
        ) : !searched ? (
          <p className="text-sm text-muted">
            {t('search.hint', { defaultValue: 'Enter a query to search this organization.' })}
          </p>
        ) : hits.length === 0 ? (
          <p className="text-sm text-muted">
            {t('search.empty', { defaultValue: 'No results found.' })}
          </p>
        ) : (
          <ul className="space-y-2">
            {hits.map((hit) => {
              const Icon = ICONS[hit.type]
              return (
                <li key={`${hit.type}-${hit.id}`}>
                  <Link to={hrefFor(orgId!, hit)}>
                    <Card className="border-border/60 transition-colors hover:border-primary/40">
                      <CardContent className="flex items-start gap-3 py-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-muted text-primary">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <Badge variant="info">{hit.type}</Badge>
                            {hit.subtitle && (
                              <span className="text-xs text-muted">{hit.subtitle}</span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-foreground line-clamp-2">
                            {hit.title}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </Container>
    </div>
  )
}
