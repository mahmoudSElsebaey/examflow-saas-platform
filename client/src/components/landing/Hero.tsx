import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowRight, Play } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Container } from '@/components/ui/Container'
import { Link } from 'react-router-dom'

export function Hero() {
  const { t } = useTranslation()
  const reduce = useReducedMotion()

  return (
    <section className="relative overflow-hidden border-b border-border bg-surface">
      <div className="pointer-events-none absolute inset-0 bg-hero-glow" />
      <div className="pointer-events-none absolute -start-24 top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -end-16 bottom-0 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />

      <Container>
        <motion.div
          className="relative flex flex-col items-center py-20 text-center sm:py-28 lg:py-32"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <Badge variant="info" className="mb-6 border border-primary/20 bg-primary-muted text-primary-800">
            {t('hero.badge')}
          </Badge>

          <h1 className="text-display max-w-4xl text-balance text-foreground">
            {t('hero.titleBefore')}{' '}
            <span className="bg-gradient-to-r from-primary to-primary-500 bg-clip-text text-transparent">
              {t('hero.titleHighlight')}
            </span>{' '}
            {t('hero.titleAfter')}
          </h1>

          <p className="mt-6 max-w-2xl text-balance text-lg text-muted sm:text-xl">
            {t('hero.description')}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="gap-2">
                {t('hero.startTrial')}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="gap-2">
              <Play className="h-4 w-4" />
              {t('hero.watchDemo')}
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">{t('hero.noCard')}</p>
        </motion.div>
      </Container>
    </section>
  )
}
