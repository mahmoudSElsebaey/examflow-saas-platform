import { useTranslation } from 'react-i18next'
import { appConfig } from '@/config/app'
import { Container } from '@/components/ui/Container'
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher'

export function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  /** Only links that resolve on the current landing page (or real routes). */
  const footerLinks = {
    [t('footer.product')]: [
      { label: t('footer.features'), href: '#features' },
      { label: t('footer.pricing'), href: '#pricing' },
    ],
    [t('footer.company')]: [
      {
        label: t('footer.contact'),
        href: `mailto:${appConfig.CONTACT_EMAIL}`,
      },
    ],
    [t('footer.legal')]: [
      { label: t('footer.privacy'), href: '/#privacy' },
      { label: t('footer.terms'), href: '/#terms' },
    ],
  }

  return (
    <footer className="relative overflow-hidden border-t border-slate-700 bg-secondary text-secondary-foreground">
      <Container>
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <a href="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-800 text-sm font-bold text-primary-foreground shadow-md shadow-primary/20">
                EF
              </span>
              <span className="text-lg font-bold text-white">
                {appConfig.APP_NAME}
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-7 text-slate-300">{appConfig.APP_TAGLINE}</p>
            <p className="mt-2 text-sm text-slate-400">{appConfig.CONTACT_EMAIL}</p>
            <div className="mt-4">
              <LanguageSwitcher />
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-bold text-white">{title}</h4>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-300 transition-colors hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 sm:flex-row">
          <p className="text-sm text-slate-400">
            © {year} {appConfig.APP_NAME}. {t('footer.rights')}
          </p>
          <p className="text-sm text-slate-400">{t('footer.tagline')}</p>
        </div>
      </Container>
    </footer>
  )
}
