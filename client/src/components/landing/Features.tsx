import { useTranslation } from 'react-i18next'
import {
  BookOpen,
  ClipboardCheck,
  BarChart3,
  Award,
  Users,
  Shield,
  Shuffle,
  Clock,
} from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Card, CardContent } from '@/components/ui/Card'

const featureKeys = [
  { icon: BookOpen, key: 'questionBanks' },
  { icon: ClipboardCheck, key: 'examBuilder' },
  { icon: Shuffle, key: 'randomization' },
  { icon: Clock, key: 'examEngine' },
  { icon: BarChart3, key: 'analytics' },
  { icon: Award, key: 'certificates' },
  { icon: Users, key: 'teams' },
  { icon: Shield, key: 'security' },
] as const

export function Features() {
  const { t } = useTranslation()

  return (
    <section id="features" className="border-b border-border bg-background py-20 sm:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t('features.title')}
          </h2>
          <p className="mt-4 text-lg text-muted">{t('features.subtitle')}</p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featureKeys.map(({ icon: Icon, key }) => (
            <Card key={key} className="border-border/80 transition-shadow hover:shadow-md">
              <CardContent className="pt-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary-muted text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-foreground">
                  {t(`features.${key}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {t(`features.${key}.description`)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  )
}
