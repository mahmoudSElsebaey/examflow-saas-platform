import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { cn } from '@/lib/utils'

const plans = [
  { key: 'starter' as const, highlighted: false },
  { key: 'professional' as const, highlighted: true },
  { key: 'enterprise' as const, highlighted: false },
]

export function Pricing() {
  const { t } = useTranslation()

  return (
    <section id="pricing" className="border-b border-border bg-background py-20 sm:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t('pricing.title')}
          </h2>
          <p className="mt-4 text-lg text-muted">{t('pricing.subtitle')}</p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => {
            const features = t(`pricing.${plan.key}.features`, {
              returnObjects: true,
            }) as string[]

            return (
              <Card
                key={plan.key}
                className={cn(
                  'relative flex flex-col',
                  plan.highlighted && 'border-primary shadow-lg ring-1 ring-primary/20'
                )}
              >
                {plan.highlighted && (
                  <Badge
                    className="absolute -top-3 start-1/2 -translate-x-1/2 rtl:translate-x-1/2"
                    variant="default"
                  >
                    {t('pricing.mostPopular')}
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{t(`pricing.${plan.key}.name`)}</CardTitle>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight text-foreground">
                      {t(`pricing.${plan.key}.price`)}
                    </span>
                    {plan.key === 'professional' && (
                      <span className="text-sm text-muted">{t('pricing.perMonth')}</span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-muted">
                    {t(`pricing.${plan.key}.description`)}
                  </p>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {(Array.isArray(features) ? features : []).map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2.5 text-sm text-foreground"
                      >
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    variant={plan.highlighted ? 'primary' : 'outline'}
                    className="w-full"
                  >
                    {t(`pricing.${plan.key}.cta`)}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
