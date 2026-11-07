import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowRight, ArrowUpRight, BookOpenCheck, ChartNoAxesCombined, ClipboardCheck, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Container } from '@/components/ui/Container'
import { Link } from 'react-router-dom'

const heroImage = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1400&q=88'

export function Hero() {
  const { t, i18n } = useTranslation()
  const reduce = useReducedMotion()
  const ar = i18n.language?.startsWith('ar')

  return (
    <section className="hero-section relative isolate overflow-hidden border-b border-border">
      <div className="hero-orb hero-orb-one" />
      <div className="hero-orb hero-orb-two" />
      <Container className="relative z-10">
        <div className="grid min-h-[680px] items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.02fr_.98fr] lg:gap-8 lg:py-24">
          <motion.div
            className="relative z-10 max-w-2xl"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
          >
            <Badge variant="info" className="mb-6 gap-2 rounded-full border border-primary/15 bg-primary-muted/80 px-4 py-2 text-primary-800">
              <Sparkles className="h-3.5 w-3.5" />
              {t('hero.badge')}
            </Badge>

            <h1 className="max-w-3xl text-balance text-4xl font-extrabold leading-[1.12] tracking-[-0.045em] text-foreground sm:text-5xl lg:text-[3.7rem]">
              {t('hero.titleBefore')}{' '}
              <span className="relative inline-block bg-gradient-to-r from-primary-700 via-primary to-primary-400 bg-clip-text text-transparent">
                {t('hero.titleHighlight')}
                <span className="hero-underline" />
              </span>{' '}
              {t('hero.titleAfter')}
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-muted sm:text-lg">
              {t('hero.description')}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link to="/register">
                <Button size="lg" className="group h-12 gap-2 rounded-xl px-6 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-xl">
                  {t('hero.startTrial')}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                </Button>
              </Link>
              <a href="#features">
                <Button variant="outline" size="lg" className="h-12 gap-2 rounded-xl border-border bg-surface/80 px-6">
                  <BookOpenCheck className="h-4 w-4 text-primary" />
                  {ar ? 'اكتشف المميزات' : 'Explore features'}
                </Button>
              </a>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground sm:text-sm">
              <span className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />{t('hero.noCard')}</span>
              <span className="hidden h-4 w-px bg-border sm:block" />
              <span>{ar ? 'عربي وإنجليزي • RTL كامل' : 'Arabic & English • Full RTL'}</span>
            </div>
          </motion.div>

          <motion.div
            className="hero-visual relative mx-auto w-full max-w-[620px] lg:ms-auto"
            initial={reduce ? false : { opacity: 0, scale: 0.96, x: ar ? -18 : 18 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.12, ease: 'easeOut' }}
          >
            <div className="hero-photo-wrap relative overflow-hidden rounded-[2rem] border-[7px] border-white/80 shadow-[0_35px_90px_-35px_rgba(15,76,72,.42)]">
              <img src={heroImage} alt={ar ? 'طلاب يتعاونون في بيئة تعليمية حديثة' : 'Students collaborating in a modern learning environment'} className="h-[390px] w-full object-cover sm:h-[490px]" fetchPriority="high" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-slate-950/5 to-transparent" />
              <div className="absolute bottom-6 start-6 end-6 text-white">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  {ar ? 'بيئة تعليمية متكاملة' : 'One connected learning space'}
                </span>
                <p className="mt-3 max-w-[18rem] text-start text-xl font-bold leading-snug sm:text-2xl">
                  {ar ? 'من أول سؤال إلى آخر شهادة، كل شيء في مكان واحد.' : 'From the first question to the final certificate, all in one place.'}
                </p>
              </div>
            </div>

            <div className="hero-float-card absolute -start-5 top-10 hidden w-52 rounded-2xl border border-white/80 bg-white/95 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur-xl sm:block">
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-muted text-primary"><ClipboardCheck className="h-5 w-5" /></span>
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">{ar ? 'نشط' : 'LIVE'}</span>
              </div>
              <p className="mt-3 text-xs font-semibold text-slate-500">{ar ? 'الاختبارات' : 'ASSESSMENTS'}</p>
              <p className="mt-1 text-lg font-extrabold text-slate-900">{ar ? 'إدارة ذكية' : 'Smart delivery'}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-3/4 rounded-full bg-primary" /></div>
            </div>

            <div className="hero-float-card absolute -end-4 bottom-24 hidden w-56 rounded-2xl border border-white/80 bg-white/95 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur-xl sm:block">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-accent"><ChartNoAxesCombined className="h-5 w-5" /></span>
                <div><p className="text-xs text-slate-500">{ar ? 'رؤية أوضح للأداء' : 'Clearer performance insights'}</p><p className="text-sm font-bold text-slate-900">{ar ? 'تحليلات وتقارير' : 'Analytics & reports'}</p></div>
                <ArrowUpRight className="ms-auto h-4 w-4 text-primary" />
              </div>
              <div className="mt-4 flex h-10 items-end gap-1.5">
                {[35, 55, 42, 72, 60, 88, 68, 100, 78, 92].map((h, i) => <span key={i} className="flex-1 rounded-t-sm bg-primary/75" style={{ height: h + '%' }} />)}
              </div>
            </div>

            <div className="pointer-events-none absolute -bottom-8 -end-7 -z-10 h-40 w-40 rounded-full border-[24px] border-accent/10" />
            <div className="pointer-events-none absolute -top-8 -start-8 -z-10 h-28 w-28 rounded-full border-[18px] border-primary/10" />
          </motion.div>
        </div>
      </Container>
    </section>
  )
}
