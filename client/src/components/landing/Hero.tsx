import { ArrowRight, Play } from 'lucide-react'
import { appConfig } from '@/config/app'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Container } from '@/components/ui/Container'

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-surface">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-primary-muted)_0%,_transparent_60%)] opacity-60" />

      <Container>
        <div className="relative flex flex-col items-center py-20 text-center sm:py-28 lg:py-32">
          <Badge variant="info" className="mb-6">
            Multi-tenant SaaS for modern education
          </Badge>

          <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Build, deliver & analyze{' '}
            <span className="text-primary">exams</span> that scale
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-muted sm:text-xl">
            {appConfig.APP_DESCRIPTION} Create question banks, design sophisticated exams,
            grade automatically, and issue certificates — all from one secure platform.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button size="lg" className="gap-2">
              Start free trial
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              <Play className="h-4 w-4" />
              Watch demo
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            No credit card required · Free for small teams
          </p>
        </div>
      </Container>
    </section>
  )
}
