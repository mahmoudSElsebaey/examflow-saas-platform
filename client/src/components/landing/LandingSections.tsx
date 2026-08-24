import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  Building2,
  GraduationCap,
  Users,
  BookOpen,
  ClipboardList,
  PenLine,
  BarChart3,
  Award,
  Shield,
  Globe2,
  Palette,
  CreditCard,
  Search,
  Bell,
  Lock,
  CheckCircle2,
  ArrowRight,
  Layers,
  Target,
  HelpCircle,
} from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

type Lang = 'ar' | 'en'

function useLang(): Lang {
  const { i18n } = useTranslation()
  return i18n.language?.startsWith('ar') ? 'ar' : 'en'
}

const copy = {
  ar: {
    whatTitle: 'ما هي ExamFlow؟',
    whatBody:
      'ExamFlow منصة SaaS تعليمية متعددة المؤسسات (Multi-Tenant) لإدارة التقييمات والامتحانات والمحتوى التعليمي. تخدم الأكاديميات والمدارس ومراكز التدريب والمعلمين المستقلين من خلال مساحة عمل واحدةحدة لكل مؤسسة مع أدوار واضحة: مالك، أدمن، معلم، ممتحن، وطالب.',
    whoTitle: 'لمن صُممت المنصة؟',
    who: [
      { title: 'مدارس وأكاديميات', desc: 'إدارة صفوف وامتحانات مركزية مع تقارير للإدارة.' },
      { title: 'مراكز تدريب', desc: 'اختبارات قبول وشهادات حضور مع علامات تجارية خاصة.' },
      { title: 'معلمون مستقلون', desc: 'بنوك أسئلة وامتحانات للطلاب دون تعقيد تقني.' },
      { title: 'فرق تعليم إلكتروني', desc: 'منهج (مواد/موضوعات/دروس) + تقييم مرتبط بالتعلّم.' },
    ],
    benefitsTitle: 'لماذا ExamFlow؟',
    benefits: [
      'تعدد مؤسسات حقيقي: كل منظمة بيانات منفصلة وصلاحيات مستقلة.',
      'تجربة طالب منفصلة عن لوحة الطاقم — أقل تشتيتًا وأكثر تركيزًا.',
      'تصحيح آلي للأسئلة الموضوعية + تصحيح يدوي للمقال القصير.',
      'أمان امتحان: رصد تبديل التبويب واللصق وفقدان التركيز.',
      'شهادات قابلة للتحقق علنًا عبر رمز فريد.',
      'تحليلات وتصدير CSV لاتخاذ قرارات تعليمية.',
      'واجهة عربية/إنجليزية مع دعم RTL كامل.',
      'White-label: اسم، لون، وشعار المؤسسة.',
    ],
    modulesTitle: 'ماذا تفعل داخل المنصة؟',
    modules: [
      { icon: Building2, title: 'المؤسسات', desc: 'إنشاء منظمة، دعوة أعضاء، أدوار، تعليق، نقل ملكية، ومغادرة.' },
      { icon: BookOpen, title: 'المحتوى والمنهج', desc: 'دورات، بنوك أسئلة، مواد Subjects، موضوعات Topics، ودروس Lessons.' },
      { icon: ClipboardList, title: 'الامتحانات', desc: 'بناء امتحان من البنك، مدة، نسبة نجاح، نشر للطلاب.' },
      { icon: PenLine, title: 'التصحيح', desc: 'آلي للـ MCQ و True/False، ويدوي للإجابات القصيرة مع ملاحظات.' },
      { icon: Shield, title: 'نزاهة الامتحان', desc: 'سياسات تتبع التبويب/اللصق، وتأخير إظهار النتائج للطلاب.' },
      { icon: BarChart3, title: 'التحليلات والتقارير', desc: 'ملخص المؤسسة، أداء الامتحان، تصدير CSV بأسماء الطلاب.' },
      { icon: Award, title: 'الشهادات', desc: 'إصدار تلقائي عند النجاح والتحقق العام بدون تسجيل دخول.' },
      { icon: GraduationCap, title: 'تعلّم الطالب', desc: 'بوابة Learn لعرض المنهج وتتبع تقدّم الدروس.' },
      { icon: Search, title: 'البحث', desc: 'بحث موحّد داخل المؤسسة عن امتحانات وأسئلة ودورات وأعضاء.' },
      { icon: Bell, title: 'الإشعارات والبريد', desc: 'إشعارات داخل التطبيق وبريد للأحداث (دعوة، نتيجة، شهادة).' },
      { icon: Palette, title: 'الهوية البصرية', desc: 'لون أساسي وشعار يظهران في مساحة عمل المؤسسة.' },
      { icon: CreditCard, title: 'الفوترة', desc: 'خطط وحدود مع Stripe أو وضع تجريبي mock.' },
    ],
    rolesTitle: 'الأدوار والصلاحيات',
    roles: [
      { role: 'Owner', desc: 'كامل الصلاحيات، الفوترة، نقل الملكية، الإعدادات.' },
      { role: 'Admin', desc: 'إدارة أعضاء ومحتوى وامتحانات بدون نقل الملكية.' },
      { role: 'Teacher / Examiner', desc: 'بناء أسئلة وامتحانات وتصحيح وعرض تحليلات.' },
      { role: 'Student', desc: 'تعلّم، أداء امتحانات، نتائج، شهادات، تقدّم شخصي.' },
    ],
    flowTitle: 'كيف تبدأ خلال دقائق؟',
    flow: [
      { step: '1', title: 'سجّل حسابًا', desc: 'من صفحة التسجيل ثم فعّل البريد إن لزم.' },
      { step: '2', title: 'أنشئ مؤسسة', desc: 'اختر اسمًا ووصفًا — تصبح المالك تلقائيًا.' },
      { step: '3', title: 'ادعُ الفريق والطلاب', desc: 'بالبريد: مسجّل يُضاف مباشرة، وغير المسجّل يستلم دعوة.' },
      { step: '4', title: 'ابنِ بنك أسئلة', desc: 'أنواع: اختيار من متعدد، صح/خطأ، إجابة قصيرة.' },
      { step: '5', title: 'أنشئ امتحانًا وانشره', desc: 'حدد المدة ونسبة النجاح وأسئلة البنك.' },
      { step: '6', title: 'راقب وصحّح وصدّر', desc: 'تصحيح يدوي عند الحاجة، تحليلات، CSV، شهادات.' },
    ],
    studentTitle: 'تجربة الطالب',
    student: [
      'الوصول للمنهج عبر Learn مع حالة كل درس.',
      'قائمة الامتحانات المتاحة وبدء محاولة مؤقتة.',
      'حفظ تلقائي للإجابات أثناء الامتحان.',
      'نتائج فورية أو مؤجلة حسب سياسة المدرّس.',
      'عرض الشهادات والتحقق العام منها.',
      'صفحة تقدّم شخصي (محاولات + دروس).',
    ],
    staffTitle: 'تجربة الطاقم (معلم / أدمن)',
    staff: [
      'لوحة عمل منظمة حسب الدور.',
      'إدارة محتوى وبنوك وأسئلة بصلاحيات.',
      'تصحيح يدوي لطابور المحاولات المعلقة.',
      'تصدير نتائج CSV مع مؤشرات النزاهة.',
      'سجل نشاط (Activity) لتدقيق التغييرات على الفريق.',
      'إعدادات الهوية والفوترة للمالك/الأدمن.',
    ],
    securityTitle: 'الأمان والخصوصية',
    security: [
      'عزل بيانات كل مؤسسة (Tenant isolation).',
      'JWT مع صلاحيات عضوية المؤسسة.',
      'تتبع أحداث الأمان أثناء المحاولة.',
      'لا يمكن إزالة أو تعليق المالك بالخطأ.',
      'شهادات عامة بالرمز فقط دون كشف بيانات حساسة.',
    ],
    i18nTitle: 'اللغة والاتجاه',
    i18nBody:
      'الواجهة تدعم العربية والإنجليزية مع تبديل فوري. العربية تعمل باتجاه RTL كامل في التنقل والنماذج والجداول.',
    pricingTitle: 'الخطط باختصار',
    pricingNote:
      'تتوفر خطة مجانية للتجربة وخطط أعلى لحدود أعضاء وامتحانات أكبر، مع تكامل Stripe أو وضع تجريبي. راجع قسم الأسعار أعلاه للتفاصيل.',
    faqTitle: 'أسئلة شائعة',
    faq: [
      {
        q: 'هل أحتاج تسجيل خروج لرؤية الصفحة الرئيسية؟',
        a: 'لا. الصفحة الرئيسية `/` عامة للجميع. إن كنت مسجّل الدخول ستجد زر لوحة التحكم في الشريط العلوي، ويمكنك زيارة الصفحة التعريفية في أي وقت.',
      },
      {
        q: 'هل يمكن لمؤسستي استخدام علامتها التجارية؟',
        a: 'نعم. من الإعدادات يمكن ضبط اللون الأساسي ورفع شعار يظهر في مساحة العمل.',
      },
      {
        q: 'كيف أضيف طلابًا لم يسجّلوا بعد؟',
        a: 'أرسل دعوة بالبريد؛ عند التسجيل بنفس البريد يمكن قبول الدعوة والانضمام بالدور المحدد.',
      },
      {
        q: 'هل التصحيح يدوي دائمًا؟',
        a: 'لا. الأسئلة الموضوعية تُصحَّح تلقائيًا. الإجابات القصيرة تدخل قائمة التصحيح اليدوي.',
      },
      {
        q: 'هل يمكن التحقق من شهادة بدون حساب؟',
        a: 'نعم عبر صفحة التحقق العامة باستخدام رمز الشهادة.',
      },
      {
        q: 'هل البيانات مشتركة بين المؤسسات؟',
        a: 'لا. كل مؤسسة معزولة تمامًا عن الأخرى.',
      },
    ],
    compareTitle: 'ماذا يغطي ExamFlow مقارنة بالامتحان التقليدي؟',
    compare: [
      { left: 'ورقة وقلم / ملفات متفرقة', right: 'بنك أسئلة مركزي ونسخ امتحان قابلة لإعادة الاستخدام' },
      { left: 'تصحيح يدوي لكل شيء', right: 'تصحيح آلي + طابور يدوي عند الحاجة' },
      { left: 'صعوبة تتبع الغش', right: 'أحداث تبويب/لصق/تركيز مسجّلة في المحاولة' },
      { left: 'تقارير يدوية', right: 'تحليلات حية وتصدير CSV' },
      { left: 'شهادات غير قابلة للتحقق', right: 'تحقق عام برمز فريد' },
    ],
    useCasesTitle: 'حالات استخدام عملية',
    useCases: [
      { title: 'اختبار منتصف الفصل', desc: 'انشر امتحانًا بوقت محدد، راجع التحليلات، صدّر الدرجات للإدارة.' },
      { title: 'تدريب موظفين', desc: 'منهج دروس قصيرة + اختبار كفاءة + شهادة عند النجاح.' },
      { title: 'معلم لغة / رياضيات', desc: 'بنك أسئلة متدرّج الصعوبة وامتحانات أسبوعية للطلاب.' },
      { title: 'أكاديمية متعددة الفروع', desc: 'مؤسسة واحدةحدة، أدوار متعددة، وسجل نشاط للتدقيق.' },
    ],
    ctaTitle: 'ابدأ مجانًا وابنِ أول امتحان اليوم',
    ctaBody: 'أنشئ مؤسستك، ادعُ طلابك، وانشر امتحانًا في أقل من ربع ساعة.',
    ctaPrimary: 'إنشاء حساب',
    ctaSecondary: 'تسجيل الدخول',
    glossaryTitle: 'قاموس سريع للمصطلحات',
    glossary: [
      { t: 'Organization', d: 'المؤسسة/الحساب التنظيمي الذي يفصل بياناتك عن الآخرين.' },
      { t: 'Question Bank', d: 'مستودع أسئلة يُعاد استخدامه في أكثر من امتحان.' },
      { t: 'Attempt', d: 'محاولة طالب لأداء امتحان مرة واحدةحدة ضمن القواعد.' },
      { t: 'Membership', d: 'ارتباط المستخدم بمؤسسة بدور وحالة (نشط/موقوف).' },
      { t: 'White-label', d: 'تخصيص المظهر باسم وشعار وألوان مؤسستك.' },
    ],
  },
  en: {
    whatTitle: 'What is ExamFlow?',
    whatBody:
      'ExamFlow is a multi-tenant educational SaaS for assessments, exams, and learning content. Academies, schools, training centers, and independent teachers each get an isolated organization workspace with clear roles: owner, admin, teacher, examiner, and student.',
    whoTitle: 'Who is it for?',
    who: [
      { title: 'Schools & academies', desc: 'Central exams, classes, and leadership-ready reports.' },
      { title: 'Training centers', desc: 'Placement tests, completion certificates, custom branding.' },
      { title: 'Independent teachers', desc: 'Question banks and exams without heavy IT setup.' },
      { title: 'E-learning teams', desc: 'Curriculum (subjects/topics/lessons) plus linked assessment.' },
    ],
    benefitsTitle: 'Why ExamFlow?',
    benefits: [
      'True multi-tenancy: isolated data and permissions per organization.',
      'Separate student experience vs staff console.',
      'Auto-grading for objective items + manual grading for short answers.',
      'Exam integrity: tab switches, paste, and focus-loss tracking.',
      'Certificates with public verification codes.',
      'Analytics and CSV export for decisions.',
      'Arabic/English UI with full RTL support.',
      'White-label: organization name, color, and logo.',
    ],
    modulesTitle: 'What can you do inside the product?',
    modules: [
      { icon: Building2, title: 'Organizations', desc: 'Create orgs, invite members, roles, suspend, transfer ownership, leave.' },
      { icon: BookOpen, title: 'Content & curriculum', desc: 'Courses, banks, subjects, topics, and lessons.' },
      { icon: ClipboardList, title: 'Exams', desc: 'Build from banks, set duration and pass %, publish to students.' },
      { icon: PenLine, title: 'Grading', desc: 'Auto MCQ/True-False; manual short answers with feedback.' },
      { icon: Shield, title: 'Integrity', desc: 'Tab/paste policies and delayed results for students.' },
      { icon: BarChart3, title: 'Analytics & reports', desc: 'Org summary, per-exam stats, CSV with student names.' },
      { icon: Award, title: 'Certificates', desc: 'Issue on pass; public verify without login.' },
      { icon: GraduationCap, title: 'Student Learn', desc: 'Curriculum viewer and lesson progress.' },
      { icon: Search, title: 'Search', desc: 'Org-wide search across exams, questions, courses, members.' },
      { icon: Bell, title: 'Notifications & email', desc: 'In-app alerts and email for invites, results, certificates.' },
      { icon: Palette, title: 'Branding', desc: 'Primary color and logo across the workspace.' },
      { icon: CreditCard, title: 'Billing', desc: 'Plans and limits via Stripe or mock mode.' },
    ],
    rolesTitle: 'Roles & permissions',
    roles: [
      { role: 'Owner', desc: 'Full control, billing, transfer ownership, settings.' },
      { role: 'Admin', desc: 'Members, content, exams — no ownership transfer.' },
      { role: 'Teacher / Examiner', desc: 'Banks, exams, grading, analytics.' },
      { role: 'Student', desc: 'Learn, take exams, results, certificates, personal progress.' },
    ],
    flowTitle: 'How to get started in minutes',
    flow: [
      { step: '1', title: 'Create an account', desc: 'Register, then verify email if required.' },
      { step: '2', title: 'Create an organization', desc: 'Name it — you become the owner.' },
      { step: '3', title: 'Invite team & students', desc: 'Registered users join immediately; others get an email invite.' },
      { step: '4', title: 'Build a question bank', desc: 'MCQ, true/false, and short answer types.' },
      { step: '5', title: 'Create & publish an exam', desc: 'Duration, pass mark, pick questions.' },
      { step: '6', title: 'Monitor, grade, export', desc: 'Manual queue when needed, analytics, CSV, certificates.' },
    ],
    studentTitle: 'Student experience',
    student: [
      'Learn portal with lesson status.',
      'Available exams and timed attempts.',
      'Autosave during the attempt.',
      'Immediate or delayed results per policy.',
      'Certificates and public verification.',
      'Personal progress (attempts + lessons).',
    ],
    staffTitle: 'Staff experience (teacher / admin)',
    staff: [
      'Role-aware workspace navigation.',
      'Content and banks with permissions.',
      'Manual grading queue.',
      'CSV export including integrity counters.',
      'Activity audit log for team changes.',
      'Branding and billing for owner/admin.',
    ],
    securityTitle: 'Security & privacy',
    security: [
      'Tenant isolation between organizations.',
      'JWT plus membership-scoped authorization.',
      'Security events stored on attempts.',
      'Owner protected from accidental remove/suspend.',
      'Public certificate verify without sensitive dumps.',
    ],
    i18nTitle: 'Language & direction',
    i18nBody:
      'Switch between Arabic and English instantly. Arabic uses full RTL for navigation, forms, and tables.',
    pricingTitle: 'Plans in short',
    pricingNote:
      'A free tier for trials and higher plans for larger teams, with Stripe or mock billing. See the pricing section above for details.',
    faqTitle: 'FAQ',
    faq: [
      {
        q: 'Do I need to log out to open the landing page?',
        a: 'No. `/` is public. If you are signed in, use Dashboard in the header — you can still visit the marketing page anytime.',
      },
      {
        q: 'Can we use our own branding?',
        a: 'Yes. Settings let you set primary color and upload a logo for the workspace.',
      },
      {
        q: 'How do I add students who are not registered yet?',
        a: 'Send an email invite; after they register with the same email they can accept and join with the chosen role.',
      },
      {
        q: 'Is grading always manual?',
        a: 'No. Objective questions are auto-graded. Short answers go to the manual grading queue.',
      },
      {
        q: 'Can certificates be verified without an account?',
        a: 'Yes, via the public verification page and certificate code.',
      },
      {
        q: 'Is data shared across organizations?',
        a: 'No. Each organization is fully isolated.',
      },
    ],
    compareTitle: 'ExamFlow vs traditional testing',
    compare: [
      { left: 'Paper / scattered files', right: 'Central banks and reusable exams' },
      { left: 'Everything graded by hand', right: 'Auto-grade + manual queue when needed' },
      { left: 'Hard to spot integrity issues', right: 'Tab/paste/focus events on attempts' },
      { left: 'Manual spreadsheets', right: 'Live analytics + CSV export' },
      { left: 'Unverifiable certificates', right: 'Public code verification' },
    ],
    useCasesTitle: 'Practical use cases',
    useCases: [
      { title: 'Midterm exam', desc: 'Timed publish, analytics, export grades for leadership.' },
      { title: 'Employee training', desc: 'Short lessons + competency test + certificate on pass.' },
      { title: 'Language / math tutor', desc: 'Difficulty-tagged banks and weekly quizzes.' },
      { title: 'Multi-branch academy', desc: 'One org, many roles, activity log for audit.' },
    ],
    ctaTitle: 'Start free and ship your first exam today',
    ctaBody: 'Create an organization, invite learners, and publish an exam in under 15 minutes.',
    ctaPrimary: 'Create account',
    ctaSecondary: 'Log in',
    glossaryTitle: 'Quick glossary',
    glossary: [
      { t: 'Organization', d: 'Your tenant — isolated workspace and data.' },
      { t: 'Question Bank', d: 'Reusable pool of questions for many exams.' },
      { t: 'Attempt', d: 'One student sitting of an exam under the rules.' },
      { t: 'Membership', d: 'User↔org link with a role and status.' },
      { t: 'White-label', d: 'Brand the workspace with your logo and colors.' },
    ],
  },
} as const

function SectionTitle({ id, title, subtitle }: { id?: string; title: string; subtitle?: string }) {
  return (
    <div id={id} className="mx-auto max-w-3xl text-center">
      <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">{title}</h2>
      {subtitle && <p className="mt-4 text-lg text-muted">{subtitle}</p>}
    </div>
  )
}

export function LandingSections() {
  const lang = useLang()
  const c = copy[lang]

  return (
    <>
      {/* What is */}
      <section id="about" className="border-b border-border bg-background py-16 sm:py-20">
        <Container>
          <SectionTitle title={c.whatTitle} />
          <p className="mx-auto mt-6 max-w-3xl text-center text-base leading-relaxed text-muted sm:text-lg">{c.whatBody}</p>
        </Container>
      </section>

      {/* Who */}
      <section id="audience" className="border-b border-border bg-surface py-16 sm:py-20">
        <Container>
          <SectionTitle title={c.whoTitle} />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {c.who.map((item) => (
              <Card key={item.title} className="border-border/60">
                <CardContent className="pt-6">
                  <Users className="mb-3 h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Benefits */}
      <section id="benefits" className="border-b border-border bg-background py-16 sm:py-20">
        <Container>
          <SectionTitle title={c.benefitsTitle} />
          <ul className="mx-auto mt-10 grid max-w-4xl gap-3 sm:grid-cols-2">
            {c.benefits.map((b) => (
              <li key={b} className="flex gap-2 rounded-xl border border-border/60 bg-surface px-4 py-3 text-sm text-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Modules */}
      <section id="modules" className="border-b border-border bg-surface py-16 sm:py-20">
        <Container>
          <SectionTitle title={c.modulesTitle} />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {c.modules.map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="border-border/60">
                <CardContent className="pt-6">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-muted text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-foreground">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Roles */}
      <section id="roles" className="border-b border-border bg-background py-16 sm:py-20">
        <Container>
          <SectionTitle title={c.rolesTitle} />
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {c.roles.map((r) => (
              <div key={r.role} className="rounded-xl border border-border/60 bg-surface p-5">
                <Badge variant="info" className="mb-2">{r.role}</Badge>
                <p className="text-sm text-muted">{r.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Flow */}
      <section id="get-started" className="border-b border-border bg-surface py-16 sm:py-20">
        <Container>
          <SectionTitle title={c.flowTitle} />
          <ol className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {c.flow.map((s) => (
              <li key={s.step} className="relative rounded-xl border border-border/60 bg-background p-5">
                <span className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {s.step}
                </span>
                <h3 className="font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1 text-sm text-muted">{s.desc}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Student vs staff */}
      <section id="experiences" className="border-b border-border bg-background py-16 sm:py-20">
        <Container>
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-bold text-foreground">
                <GraduationCap className="h-6 w-6 text-primary" />
                {c.studentTitle}
              </h2>
              <ul className="mt-6 space-y-3">
                {c.student.map((x) => (
                  <li key={x} className="flex gap-2 text-sm text-muted">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-bold text-foreground">
                <Layers className="h-6 w-6 text-primary" />
                {c.staffTitle}
              </h2>
              <ul className="mt-6 space-y-3">
                {c.staff.map((x) => (
                  <li key={x} className="flex gap-2 text-sm text-muted">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* Security */}
      <section id="security" className="border-b border-border bg-surface py-16 sm:py-20">
        <Container>
          <SectionTitle title={c.securityTitle} />
          <ul className="mx-auto mt-10 grid max-w-3xl gap-3">
            {c.security.map((s) => (
              <li key={s} className="flex gap-2 rounded-lg border border-border/60 bg-background px-4 py-3 text-sm">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {s}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* i18n */}
      <section id="languages" className="border-b border-border bg-background py-16 sm:py-20">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Globe2 className="mx-auto mb-4 h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold text-foreground">{c.i18nTitle}</h2>
            <p className="mt-4 text-lg text-muted">{c.i18nBody}</p>
          </div>
        </Container>
      </section>

      {/* Compare */}
      <section id="compare" className="border-b border-border bg-surface py-16 sm:py-20">
        <Container>
          <SectionTitle title={c.compareTitle} />
          <div className="mx-auto mt-10 max-w-3xl space-y-3">
            {c.compare.map((row) => (
              <div key={row.left} className="grid gap-2 rounded-xl border border-border/60 bg-background p-4 sm:grid-cols-2">
                <p className="text-sm text-muted line-through decoration-muted/50">{row.left}</p>
                <p className="text-sm font-medium text-foreground">{row.right}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Use cases */}
      <section id="use-cases" className="border-b border-border bg-background py-16 sm:py-20">
        <Container>
          <SectionTitle title={c.useCasesTitle} />
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {c.useCases.map((u) => (
              <Card key={u.title} className="border-border/60">
                <CardContent className="pt-6">
                  <Target className="mb-3 h-5 w-5 text-primary" />
                  <h3 className="font-semibold">{u.title}</h3>
                  <p className="mt-2 text-sm text-muted">{u.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Glossary */}
      <section id="glossary" className="border-b border-border bg-surface py-16 sm:py-20">
        <Container>
          <SectionTitle title={c.glossaryTitle} />
          <dl className="mx-auto mt-10 grid max-w-3xl gap-4">
            {c.glossary.map((g) => (
              <div key={g.t} className="rounded-xl border border-border/60 bg-background px-4 py-3">
                <dt className="font-semibold text-foreground">{g.t}</dt>
                <dd className="mt-1 text-sm text-muted">{g.d}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* Pricing note */}
      <section id="plans-note" className="border-b border-border bg-background py-12">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-xl font-bold text-foreground">{c.pricingTitle}</h2>
            <p className="mt-3 text-muted">{c.pricingNote}</p>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-b border-border bg-surface py-16 sm:py-20">
        <Container>
          <SectionTitle title={c.faqTitle} />
          <div className="mx-auto mt-10 max-w-3xl space-y-4">
            {c.faq.map((f) => (
              <details key={f.q} className="group rounded-xl border border-border/60 bg-background px-5 py-4">
                <summary className="flex cursor-pointer list-none items-start gap-2 font-medium text-foreground">
                  <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {f.q}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted ps-6">{f.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section id="start" className="bg-primary py-16 text-primary-foreground sm:py-20">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">{c.ctaTitle}</h2>
            <p className="mt-4 text-primary-foreground/90">{c.ctaBody}</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/register">
                <Button size="lg" variant="secondary" className="gap-2">
                  {c.ctaPrimary}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10">
                  {c.ctaSecondary}
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
