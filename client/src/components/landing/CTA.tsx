import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Link } from 'react-router-dom'

export function CTA() {
  const { t } = useTranslation()

  return (
    <section className="relative overflow-hidden border-b border-border bg-primary">
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute -start-20 top-0 h-64 w-64 rounded-full bg-primary-300 blur-3xl" />
        <div className="absolute -end-10 bottom-0 h-48 w-48 rounded-full bg-accent/40 blur-3xl" />
      </div>
      <Container className="relative">
        <div className="flex flex-col items-center py-16 text-center sm:py-20">
          <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl text-balance">
            {t('cta.title')}
          </h2>
          <p className="mt-4 max-w-xl text-lg text-primary-foreground/85">
            {t('cta.subtitle')}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/register">
              <Button
                size="lg"
                className="gap-2 bg-surface text-foreground shadow-lg hover:bg-surface/95"
              >
                {t('cta.startTrial')}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/35 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
            >
              {t('cta.talkSales')}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  )
}
