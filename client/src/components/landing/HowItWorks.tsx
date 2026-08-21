import { Container } from '@/components/ui/Container'

const steps = [
  {
    step: '01',
    title: 'Create your organization',
    description:
      'Sign up, set up your brand, invite teachers and staff, and configure roles in under five minutes.',
  },
  {
    step: '02',
    title: 'Build question banks & exams',
    description:
      'Import or author questions, organize them into banks, then assemble exams with sections and rules.',
  },
  {
    step: '03',
    title: 'Deliver & monitor',
    description:
      'Schedule exams, share secure links, and watch attempts in real time with auto-save and recovery.',
  },
  {
    step: '04',
    title: 'Grade, analyze & certify',
    description:
      'Automatic grading for objective questions, rich analytics, and one-click certificate issuance.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-border bg-surface py-20 sm:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How ExamFlow works
          </h2>
          <p className="mt-4 text-lg text-muted">
            A clear path from setup to certificates — designed for real educational workflows.
          </p>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((item) => (
            <div key={item.step} className="relative">
              <span className="text-4xl font-bold text-primary/20">{item.step}</span>
              <h3 className="mt-2 text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
