import { useTranslation } from 'react-i18next'
import { Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'

const plans = [
  { key: 'starter' as const, highlighted: false, image: 'photo-1498243691581-b145c3f54a5a' },
  { key: 'professional' as const, highlighted: true, image: 'photo-1522202176988-66273c2fd55f' },
  { key: 'enterprise' as const, highlighted: false, image: 'photo-1521737711867-e3b97375f902' },
]

export function Pricing() {
  const { t, i18n } = useTranslation()
  const ar = i18n.language?.startsWith('ar')

  return (
    <section id="pricing" className="relative overflow-hidden border-b border-border bg-background py-20 sm:py-28">
      <div className="pointer-events-none absolute -end-40 bottom-0 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
      <Container className="relative">
        <div className="mx-auto max-w-2xl text-center">
          <span className="section-eyebrow">{ar ? 'اختر ما يناسب نموك' : 'PLANS THAT GROW WITH YOU'}</span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">{t('pricing.title')}</h2>
          <p className="mt-4 text-base leading-8 text-muted sm:text-lg">{t('pricing.subtitle')}</p>
        </div>

        <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-3">
          {plans.map((plan) => {
            const features = t(`pricing.${plan.key}.features`, { returnObjects: true }) as string[]
            return (
              <Card key={plan.key} className={cn(
                'relative flex flex-col overflow-hidden rounded-3xl border bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
                plan.highlighted ? 'z-10 border-primary/50 shadow-xl shadow-primary/10 ring-2 ring-primary/15 lg:scale-[1.035]' : 'border-border/70'
              )}>
                <div className="relative h-32 overflow-hidden">
                  <img src={`https://images.unsplash.com/${plan.image}?auto=format&fit=crop&w=900&q=82`} alt="" loading="lazy" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 to-primary-900/20" />
                  <span className="absolute bottom-4 start-5 text-sm font-bold tracking-wide text-white">{t(`pricing.${plan.key}.name`)}</span>
                  {plan.highlighted && <span className="absolute end-4 top-4 flex items-center gap-1 rounded-full bg-accent px-3 py-1.5 text-[10px] font-bold text-white shadow-lg"><Sparkles className="h-3 w-3" />{t('pricing.mostPopular')}</span>}
                </div>
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">{t(`pricing.${plan.key}.name`)}</CardTitle>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold tracking-tight text-foreground">{t(`pricing.${plan.key}.price`)}</span>
                    {plan.key === 'professional' && <span className="text-sm text-muted">{t('pricing.perMonth')}</span>}
                  </div>
                  <p className="mt-2 text-sm text-muted">{t(`pricing.${plan.key}.description`)}</p>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {(Array.isArray(features) ? features : []).map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm text-foreground">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-muted text-primary"><Check className="h-3 w-3" /></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-5">
                  <Link to="/register" className="w-full">
                    <Button variant={plan.highlighted ? 'primary' : 'outline'} className="h-11 w-full rounded-xl">{t(`pricing.${plan.key}.cta`)}</Button>
                  </Link>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
