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

const features = [
  {
    icon: BookOpen,
    title: 'Question Banks',
    description:
      'Organize questions by subject, topic, and difficulty. Support for multiple question types with full versioning.',
  },
  {
    icon: ClipboardCheck,
    title: 'Exam Builder',
    description:
      'Create exams with sections, randomized pools, time limits, and advanced delivery settings in minutes.',
  },
  {
    icon: Shuffle,
    title: 'Smart Randomization',
    description:
      'Pool-based question selection and answer shuffling so every student gets a unique yet fair exam.',
  },
  {
    icon: Clock,
    title: 'Secure Exam Engine',
    description:
      'Server-side timing, auto-save, recovery from disconnects, and controlled navigation during attempts.',
  },
  {
    icon: BarChart3,
    title: 'Deep Analytics',
    description:
      'Student, class, and organization-level insights. Identify weak topics and measure learning outcomes.',
  },
  {
    icon: Award,
    title: 'Certificates',
    description:
      'Automatically issue verifiable certificates after successful completion. White-label ready.',
  },
  {
    icon: Users,
    title: 'Teams & Roles',
    description:
      'Invite teachers, examiners, and students. Fine-grained RBAC keeps every organization secure.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description:
      'Multi-tenant isolation, audit logs, JWT authentication, and industry-standard security practices.',
  },
]

export function Features() {
  return (
    <section id="features" className="border-b border-border bg-background py-20 sm:py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to run assessments at scale
          </h2>
          <p className="mt-4 text-lg text-muted">
            From question banks to certificates — one platform for the entire exam lifecycle.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="border-border/80 transition-shadow hover:shadow-md"
            >
              <CardContent className="pt-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary-muted text-primary">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  )
}
