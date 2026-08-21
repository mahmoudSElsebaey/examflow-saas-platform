import { Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { cn } from '@/lib/utils'

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'For individual teachers and small groups getting started.',
    features: [
      '1 organization',
      'Up to 50 students',
      '200 questions',
      'Basic analytics',
      'Email support',
    ],
    cta: 'Start free',
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '$49',
    period: '/month',
    description: 'For academies and training centers that need more power.',
    features: [
      'Unlimited students',
      'Unlimited questions',
      'Advanced analytics',
      'Certificates',
      'Question import',
      'Priority support',
    ],
    cta: 'Start trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For institutions that need white-label, SSO, and SLAs.',
    features: [
      'Everything in Professional',
      'White-label branding',
      'SSO / SAML',
      'Dedicated support',
      'Custom integrations',
      'SLA & audit logs',
    ],
    cta: 'Contact sales',
    highlighted: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="border-b border-border bg-background py-20 sm:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-muted">
            Start free. Upgrade when your institution grows. No hidden fees.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                'relative flex flex-col',
                plan.highlighted && 'border-primary shadow-lg ring-1 ring-primary/20'
              )}
            >
              {plan.highlighted && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2" variant="default">
                  Most popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight text-foreground">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-sm text-muted">{plan.period}</span>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted">{plan.description}</p>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-foreground">
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
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  )
}
