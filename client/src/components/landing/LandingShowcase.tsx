import { useTranslation } from 'react-i18next'
import { useReducedMotion } from 'motion/react'
import { ArrowUpRight, GraduationCap, Landmark, MonitorPlay, UsersRound } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, A11y, Keyboard, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import { Container } from '@/components/ui/Container'

const slides = [
  {
    image: 'photo-1509062522246-3755977927d7',
    icon: Landmark,
    en: { tag: 'SCHOOLS & ACADEMIES', title: 'Bring every class into one clear view', body: 'Coordinate exams, learning content, and progress across your organization.' },
    ar: { tag: 'المدارس والأكاديميات', title: 'اجمع الفصول والاختبارات في مساحة واحدة', body: 'نظّم الامتحانات والمحتوى التعليمي وتقدّم الطلاب داخل مؤسستك.' },
  },
  {
    image: 'photo-1522202176988-66273c2fd55f',
    icon: UsersRound,
    en: { tag: 'TRAINING CENTERS', title: 'Make every training outcome measurable', body: 'Run placement tests, track performance, and issue certificates after success.' },
    ar: { tag: 'مراكز التدريب', title: 'حوّل نتائج التدريب إلى مؤشرات واضحة', body: 'قدّم اختبارات تحديد المستوى، وتابع الأداء، وأصدر الشهادات عند النجاح.' },
  },
  {
    image: 'photo-1434030216411-0b793f4b4173',
    icon: GraduationCap,
    en: { tag: 'INDEPENDENT EDUCATORS', title: 'Spend more time teaching, less time organizing', body: 'Build reusable question banks and publish focused assessments for learners.' },
    ar: { tag: 'المعلمون المستقلون', title: 'وقت أكبر للتدريس ووقت أقل للتنظيم', body: 'أنشئ بنوك أسئلة قابلة لإعادة الاستخدام وانشر اختبارات لطلابك بسهولة.' },
  },
  {
    image: 'photo-1516321318423-f06f85e504b3',
    icon: MonitorPlay,
    en: { tag: 'DIGITAL LEARNING TEAMS', title: 'Connect learning content with assessment', body: 'Keep courses, lessons, exams, and learner progress working together.' },
    ar: { tag: 'فرق التعلم الإلكتروني', title: 'اربط المحتوى التعليمي بالتقييم', body: 'اجعل المقررات والدروس والاختبارات وتقدم المتعلمين تعمل معًا.' },
  },
]

export function LandingShowcase() {
  const { i18n } = useTranslation()
  const reduce = useReducedMotion()
  const ar = i18n.language?.startsWith('ar')

  return (
    <section className="relative overflow-hidden border-b border-border bg-[#f0eeea] py-20 sm:py-24">
      <div className="pointer-events-none absolute -start-24 top-12 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <Container className="relative">
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <span className="section-eyebrow">{ar ? 'مصممة لطرق تعليم مختلفة' : 'BUILT FOR DIFFERENT LEARNING JOURNEYS'}</span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {ar ? 'كل مؤسسة لها طريقتها. ExamFlow تجمعها.' : 'Every learning team is different. ExamFlow brings it together.'}
            </h2>
            <p className="mt-4 max-w-xl leading-7 text-muted">
              {ar ? 'استكشف كيف يمكن لمساحة عمل واحدة أن تدعم المدارس ومراكز التدريب والمعلمين وفرق التعلم.' : 'See how one connected workspace can support schools, training centers, educators, and digital learning teams.'}
            </p>
          </div>
          <span className="hidden shrink-0 rounded-full border border-primary/15 bg-white/70 px-4 py-2 text-xs font-bold tracking-wide text-primary sm:inline-flex">
            {ar ? 'اسحب لاستكشاف المزيد' : 'SWIPE TO EXPLORE'}
          </span>
        </div>

        <Swiper
          key={ar ? 'showcase-ar' : 'showcase-en'}
          dir={ar ? 'rtl' : 'ltr'}
          modules={[Autoplay, A11y, Keyboard, Pagination]}
          slidesPerView={1.08}
          spaceBetween={16}
          loop
          keyboard={{ enabled: true }}
          pagination={{ clickable: true }}
          autoplay={reduce ? false : { delay: 4600, disableOnInteraction: false, pauseOnMouseEnter: true }}
          breakpoints={{ 640: { slidesPerView: 1.5, spaceBetween: 20 }, 900: { slidesPerView: 2.25, spaceBetween: 22 }, 1200: { slidesPerView: 2.7, spaceBetween: 24 } }}
          className="examflow-showcase-swiper !pb-14"
        >
          {slides.map((slide) => {
            const copy = ar ? slide.ar : slide.en
            const Icon = slide.icon
            return (
              <SwiperSlide key={slide.en.tag} className="h-auto">
                <article className="group relative h-[410px] overflow-hidden rounded-[1.7rem] bg-slate-900 shadow-lg shadow-slate-900/10 sm:h-[450px]">
                  <img src={`https://images.unsplash.com/${slide.image}?auto=format&fit=crop&w=1100&q=86`} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-slate-950/5" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-7">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/25 bg-white/15 backdrop-blur-md"><Icon className="h-6 w-6" /></div>
                    <p className="text-[10px] font-bold tracking-[.18em] text-white/75">{copy.tag}</p>
                    <h3 className="mt-3 max-w-sm text-2xl font-extrabold leading-tight sm:text-[1.7rem]">{copy.title}</h3>
                    <p className="mt-3 max-w-sm text-sm leading-6 text-white/80">{copy.body}</p>
                    <a href="#modules" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-white transition-all hover:gap-3">
                      {ar ? 'استكشف الوحدات' : 'Explore modules'} <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </div>
                </article>
              </SwiperSlide>
            )
          })}
        </Swiper>
      </Container>
    </section>
  )
}
