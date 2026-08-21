import { useTranslation } from 'react-i18next'
import { ArrowRight, Play } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Container } from '@/components/ui/Container'

export function Hero() {
  const { t } = useTranslation()

  return (
    <section className="relative overflow-hidden border-b border-border bg-surface">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-primary-muted)_0%,_transparent_60%)] opacity-60" />

      <Container>
        <div className="relative flex flex-col items-center py-20 text-center sm:py-28 lg:py-32">
          <Badge variant="info" className="mb-6">
            {t('hero.badge')}
          </Badge>

          <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {t('hero.titleBefore')}{' '}
            <span className="text-primary">{t('hero.titleHighlight')}</span>{' '}
            {t('hero.titleAfter')}
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-muted sm:text-xl">
            {t('hero.description')}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" className="gap-2">
              {t('hero.startTrial')}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              <Play className="h-4 w-4" />
              {t('hero.watchDemo')}
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">{t('hero.noCard')}</p>
        </div>
      </Container>
    </section>
  )
}
