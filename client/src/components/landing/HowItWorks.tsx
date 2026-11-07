import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'motion/react'
import { Container } from '@/components/ui/Container'

const steps = [
  { key: 'step1', number: '01', image: 'photo-1521737711867-e3b97375f902' },
  { key: 'step2', number: '02', image: 'photo-1434030216411-0b793f4b4173' },
  { key: 'step3', number: '03', image: 'photo-1516321318423-f06f85e504b3' },
  { key: 'step4', number: '04', image: 'photo-1551288049-bebda4e38f71' },
] as const

export function HowItWorks() {
  const { t, i18n } = useTranslation()
  const reduce = useReducedMotion()
  const ar = i18n.language?.startsWith('ar')

  return (
    <section id="how-it-works" className="relative overflow-hidden border-b border-border bg-surface py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-hero-glow opacity-60" />
      <Container className="relative">
        <div className="mx-auto max-w-2xl text-center">
          <span className="section-eyebrow">{ar ? 'بداية بسيطة ونتائج ملموسة' : 'A SIMPLE PATH TO BETTER ASSESSMENTS'}</span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">{t('howItWorks.title')}</h2>
          <p className="mt-4 text-base leading-8 text-muted sm:text-lg">{t('howItWorks.subtitle')}</p>
        </div>

        <div className="relative mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="pointer-events-none absolute start-[12%] end-[12%] top-8 hidden h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent lg:block" />
          {steps.map(({ key, number, image }, i) => (
            <motion.article
              key={key}
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: reduce ? 0 : i * 0.08 }}
              className="group relative overflow-hidden rounded-2xl border border-border/70 bg-surface-elevated shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative h-40 overflow-hidden">
                <img src={`https://images.unsplash.com/${image}?auto=format&fit=crop&w=760&q=82`} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent" />
                <span className="absolute bottom-4 start-4 flex h-11 w-11 items-center justify-center rounded-xl border border-white/30 bg-white/90 text-lg font-black text-primary shadow-lg">{number}</span>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-foreground">{t(`howItWorks.${key}.title`)}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{t(`howItWorks.${key}.description`)}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </Container>
    </section>
  )
}
