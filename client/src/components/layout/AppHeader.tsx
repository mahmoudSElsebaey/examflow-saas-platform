import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/features/auth/AuthContext'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'
import { appConfig } from '@/config/app'

type Props = {
  homeTo?: string
  brandTitle?: string
  logoUrl?: string | null
}

export function AppHeader({ homeTo = '/app', brandTitle, logoUrl }: Props) {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const title = brandTitle || appConfig.APP_NAME

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 glass">
      <Container>
        <div className="flex h-14 items-center justify-between gap-3">
          <Link to={homeTo} className="flex min-w-0 items-center gap-2">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={title}
                className="h-8 w-8 rounded-lg object-contain"
              />
            ) : (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-800 text-xs font-bold text-primary-foreground">
                EF
              </span>
            )}
            <span className="truncate font-bold text-foreground">{title}</span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher variant="compact" />
            {user && (
              <span className="hidden text-sm text-muted sm:inline">{user.firstName}</span>
            )}
            <Button variant="outline" size="sm" onClick={() => logout()}>
              {t('common.logOut')}
            </Button>
          </div>
        </div>
      </Container>
    </header>
  )
}
