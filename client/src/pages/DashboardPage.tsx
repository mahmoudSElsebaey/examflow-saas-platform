import { useTranslation } from 'react-i18next'
import { useAuth } from '@/features/auth/AuthContext'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { Badge } from '@/components/ui/Badge'
import { appConfig } from '@/config/app'
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'
import { Link } from 'react-router-dom'
import { BookOpen, ClipboardList, Users } from 'lucide-react'

export function DashboardPage() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-mesh">
      <header className="sticky top-0 z-40 border-b border-border/50 glass">
        <Container>
          <div className="flex h-14 items-center justify-between gap-3">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-800 text-xs font-bold text-primary-foreground shadow-sm">
                EF
              </span>
              <span className="font-bold text-foreground">{appConfig.APP_NAME}</span>
            </Link>
            <div className="flex items-center gap-3">
              <LanguageSwitcher variant="compact" />
              <span className="hidden text-sm text-muted sm:inline">
                {user?.firstName} {user?.lastName}
              </span>
              <Button variant="outline" size="sm" onClick={() => logout()}>
                {t('common.logOut')}
              </Button>
            </div>
          </div>
        </Container>
      </header>

      <Container className="py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t('dashboard.welcome', { name: user?.firstName ?? '' })}
          </h1>
          <p className="mt-1 text-muted">{t('dashboard.subtitle')}</p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            { icon: BookOpen, label: t('features.questionBanks.title') },
            { icon: ClipboardList, label: t('features.examBuilder.title') },
            { icon: Users, label: t('features.teams.title') },
          ].map(({ icon: Icon, label }) => (
            <Card key={label} className="border-border/60 bg-surface">
              <CardContent className="flex items-center gap-3 pt-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-muted text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold text-foreground">{label}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">{t('dashboard.account')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="text-muted">{t('dashboard.email')}:</span>{' '}
                <span className="font-medium">{user?.email}</span>
              </p>
              <p className="flex flex-wrap items-center gap-2">
                <span className="text-muted">{t('dashboard.role')}:</span>
                <Badge variant="info">{user?.role}</Badge>
              </p>
              <p className="flex flex-wrap items-center gap-2">
                <span className="text-muted">{t('dashboard.emailVerified')}:</span>
                <Badge variant={user?.isEmailVerified ? 'success' : 'warning'}>
                  {user?.isEmailVerified ? t('dashboard.yes') : t('dashboard.pending')}
                </Badge>
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/60 sm:col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">{t('dashboard.comingNext')}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted leading-relaxed">
              {t('dashboard.comingNextBody')}
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  )
}
