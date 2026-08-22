import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Bell, Shield } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'
import { appConfig } from '@/config/app'
import * as notifApi from '@/features/notifications/api'
import type { NotificationItem } from '@/features/notifications/api'

type Props = {
  homeTo?: string
  brandTitle?: string
  logoUrl?: string | null
}

export function AppHeader({ homeTo = '/app', brandTitle, logoUrl }: Props) {
  const { t } = useTranslation()
  const { user, accessToken, logout } = useAuth()
  const title = brandTitle || appConfig.APP_NAME
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<NotificationItem[]>([])
  const [unread, setUnread] = useState(0)

  const isSuperAdmin = user?.role === 'super_admin'

  useEffect(() => {
    if (!accessToken) return
    void notifApi
      .listNotificationsApi(accessToken)
      .then((res) => {
        setItems(res.data?.items ?? [])
        setUnread(res.data?.unreadCount ?? 0)
      })
      .catch(() => {})
  }, [accessToken])

  const markAll = async () => {
    if (!accessToken) return
    try {
      await notifApi.markAllNotificationsReadApi(accessToken)
      setUnread(0)
      setItems((prev) =>
        prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() }))
      )
    } catch {
      /* ignore */
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur">
      <Container className="flex h-14 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to={homeTo}
            className="flex min-w-0 items-center gap-2 font-semibold text-foreground"
          >
            {logoUrl ? (
              <img src={logoUrl} alt="" className="h-7 w-7 shrink-0 rounded object-contain" />
            ) : (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-800 text-[10px] font-bold text-primary-foreground">
                EF
              </span>
            )}
            <span className="truncate">{title}</span>
          </Link>
          {homeTo !== '/app' && (
            <Link
              to="/app"
              className="hidden text-xs font-medium text-muted hover:text-foreground sm:inline"
            >
              {t('nav.appHome')}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {isSuperAdmin && (
            <Link to="/app/admin">
              <Button type="button" size="sm" variant="ghost" className="gap-1.5">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">{t('nav.admin')}</span>
              </Button>
            </Link>
          )}

          {user && (
            <div className="relative">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="relative"
                onClick={() => setOpen((v) => !v)}
                aria-label={t('notifications.title')}
              >
                <Bell className="h-4 w-4" />
                {unread > 0 && (
                  <span className="absolute -end-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-white">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </Button>
              {open && (
                <div className="absolute end-0 z-50 mt-2 w-80 max-w-[90vw] rounded-xl border border-border bg-surface p-2 shadow-lg">
                  <div className="mb-2 flex items-center justify-between px-2">
                    <span className="text-sm font-semibold">{t('notifications.title')}</span>
                    {items.length > 0 && (
                      <button
                        type="button"
                        className="text-xs text-primary hover:underline"
                        onClick={() => void markAll()}
                      >
                        {t('notifications.markAll')}
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 space-y-1 overflow-y-auto">
                    {items.length === 0 ? (
                      <p className="px-2 py-6 text-center text-sm text-muted">
                        {t('notifications.empty')}
                      </p>
                    ) : (
                      items.map((n) => (
                        <Link
                          key={n.id}
                          to={n.link || '/app'}
                          onClick={() => setOpen(false)}
                          className={`block rounded-lg px-2 py-2 text-start text-sm hover:bg-surface-subtle ${
                            !n.readAt ? 'bg-primary-muted/40' : ''
                          }`}
                        >
                          <p className="font-medium text-foreground">{n.title}</p>
                          <p className="text-xs text-muted">{n.body}</p>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <LanguageSwitcher />

          {user && (
            <div className="hidden items-center gap-2 sm:flex">
              <span className="max-w-[8rem] truncate text-sm text-muted">
                {user.firstName}
              </span>
              <Button size="sm" variant="outline" onClick={() => void logout()}>
                {t('auth.logout')}
              </Button>
            </div>
          )}
          {user && (
            <Button
              size="sm"
              variant="outline"
              className="sm:hidden"
              onClick={() => void logout()}
            >
              {t('auth.logout')}
            </Button>
          )}
        </div>
      </Container>
    </header>
  )
}
