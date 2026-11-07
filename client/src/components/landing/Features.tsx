import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'motion/react'
import {
  BookOpen, ClipboardCheck, BarChart3, Award, Users, Shield, Shuffle, Clock, ArrowUpRight,
} from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Card, CardContent } from '@/components/ui/Card'

const featureItems = [
  { icon: BookOpen, key: 'questionBanks', image: 'photo-1498243691581-b145c3f54a5a', alt: 'Library shelves and study resources' },
  { icon: ClipboardCheck, key: 'examBuilder', image: 'photo-1434030216411-0b793f4b4173', alt: 'Student preparing written work' },
  { icon: Shuffle, key: 'randomization', image: 'photo-1509062522246-3755977927d7', alt: 'Modern classroom' },
  { icon: Clock, key: 'examEngine', image: 'photo-1516321318423-f06f85e504b3', alt: 'Digital learning on a laptop' },
  { icon: BarChart3, key: 'analytics', image: 'photo-1551288049-bebda4e38f71', alt: 'Data analytics on a screen' },
  { icon: Award, key: 'certificates', image: 'photo-1523050854058-8df90110c9f1', alt: 'Graduates celebrating' },
  { icon: Users, key: 'teams', image: 'photo-1522202176988-66273c2fd55f', alt: 'Team collaborating around a table' },
  { icon: Shield, key: 'security', image: 'photo-1454165804606-c3d57bc86b40', alt: 'Professional reviewing work securely' },
] as const

export function Features() {
  const { t, i18n } = useTranslation()
  const reduce = useReducedMotion()
  const ar = i18n.language?.startsWith('ar')

  return (
    <section id="features" className="relative overflow-hidden border-b border-border bg-background py-20 sm:py-28">
      <div className="pointer-events-none absolute -end-40 top-20 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      <Container className="relative">
        <div className="mx-auto max-w-2xl text-center">
          <span className="section-eyebrow">{ar ? 'منصة واحدة، إمكانيات أوسع' : 'ONE PLATFORM, MORE POSSIBILITIES'}</span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl text-balance">
            {t('features.title')}
          </h2>
          <p className="mt-5 text-base leading-8 text-muted sm:text-lg">{t('features.subtitle')}</p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featureItems.map(({ icon: Icon, key, image, alt }, i) => (
            <motion.div
              key={key}
              initial={reduce ? false : { opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.45, delay: reduce ? 0 : (i % 4) * 0.06 }}
            >
              <Card className="feature-card group h-full overflow-hidden border-border/70 bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/8">
                <div className="feature-card-image relative h-36 overflow-hidden">
                  <img src={`https://images.unsplash.com/${image}?auto=format&fit=crop&w=700&q=82`} alt={alt} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-950/5 to-transparent" />
                  <span className="absolute bottom-3 start-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/30 bg-white/90 text-primary shadow-lg backdrop-blur"><Icon className="h-5 w-5" /></span>
                  <span className="absolute end-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/35 bg-white/20 text-white opacity-0 backdrop-blur transition-all duration-300 group-hover:opacity-100"><ArrowUpRight className="h-4 w-4" /></span>
                </div>
                <CardContent className="p-5">
                  <h3 className="text-base font-bold text-foreground">{t(`features.${key}.title`)}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{t(`features.${key}.description`)}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  )
}
