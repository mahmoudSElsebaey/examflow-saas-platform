import { appConfig } from '@/config/app'
import { Container } from '@/components/ui/Container'

const footerLinks = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Roadmap', href: '#' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  Resources: [
    { label: 'Documentation', href: '#' },
    { label: 'Help Center', href: '#' },
    { label: 'Status', href: '#' },
  ],
  Legal: [
    { label: 'Privacy', href: '#' },
    { label: 'Terms', href: '#' },
    { label: 'Security', href: '#' },
  ],
}

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-surface">
      <Container>
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <a href="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
                EF
              </span>
              <span className="text-lg font-semibold text-foreground">
                {appConfig.APP_NAME}
              </span>
            </a>
            <p className="mt-4 max-w-xs text-sm text-muted">
              {appConfig.APP_TAGLINE}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {appConfig.CONTACT_EMAIL}
            </p>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-foreground">{title}</h4>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-border py-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {year} {appConfig.APP_NAME}. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Built for education · Multi-tenant by design
          </p>
        </div>
      </Container>
    </footer>
  )
}
