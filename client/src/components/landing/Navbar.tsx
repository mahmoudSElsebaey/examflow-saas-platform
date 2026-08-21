import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu, X } from 'lucide-react'
import { appConfig } from '@/config/app'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'
import { cn } from '@/lib/utils'

export function Navbar() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const navLinks = [
    { label: t('nav.features'), href: '#features' },
    { label: t('nav.howItWorks'), href: '#how-it-works' },
    { label: t('nav.pricing'), href: '#pricing' },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 glass">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-800 text-sm font-bold text-primary-foreground shadow-md shadow-primary/25 transition-transform group-hover:scale-105">
              EF
            </span>
            <span className="text-lg font-bold tracking-tight text-foreground">
              {appConfig.APP_NAME}
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-subtle hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <LanguageSwitcher />
            <Link to="/login">
              <Button variant="ghost" size="sm">
                {t('common.logIn')}
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="primary" size="sm">
                {t('common.getStarted')}
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher variant="compact" />
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg p-2 text-muted hover:bg-surface-subtle"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={t('nav.toggleMenu')}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div
          className={cn(
            'overflow-hidden transition-all duration-300 md:hidden',
            open ? 'max-h-72 pb-4' : 'max-h-0'
          )}
        >
          <nav className="flex flex-col gap-1 pt-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-surface-subtle hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
              <Link to="/login" onClick={() => setOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">
                  {t('common.logIn')}
                </Button>
              </Link>
              <Link to="/register" onClick={() => setOpen(false)}>
                <Button variant="primary" size="sm" className="w-full">
                  {t('common.getStarted')}
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </Container>
    </header>
  )
}
