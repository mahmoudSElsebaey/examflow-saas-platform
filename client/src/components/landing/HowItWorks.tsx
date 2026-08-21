import { useTranslation } from 'react-i18next'
import { Container } from '@/components/ui/Container'

const steps = ['step1', 'step2', 'step3', 'step4'] as const
const stepNumbers = ['01', '02', '03', '04']

export function HowItWorks() {
  const { t } = useTranslation()

  return (
    <section id="how-it-works" className="border-b border-border bg-surface py-20 sm:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t('howItWorks.title')}
          </h2>
          <p className="mt-4 text-lg text-muted">{t('howItWorks.subtitle')}</p>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((key, i) => (
            <div key={key} className="relative">
              <span className="text-4xl font-bold text-primary/20">{stepNumbers[i]}</span>
              <h3 className="mt-2 text-lg font-semibold text-foreground">
                {t(`howItWorks.${key}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {t(`howItWorks.${key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
