import { useTranslation } from 'react-i18next'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'

export function CTA() {
  const { t } = useTranslation()

  return (
    <section className="border-b border-border bg-primary">
      <Container>
        <div className="flex flex-col items-center py-16 text-center sm:py-20">
          <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
            {t('cta.title')}
          </h2>
          <p className="mt-4 max-w-xl text-lg text-primary-foreground/80">
            {t('cta.subtitle')}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="gap-2 bg-surface text-foreground hover:bg-surface/90"
            >
              {t('cta.startTrial')}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10"
            >
              {t('cta.talkSales')}
            </Button>
          </div>
        </div>
      </Container>
    </section>
  )
}
