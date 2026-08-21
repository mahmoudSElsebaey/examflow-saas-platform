import { ArrowRight } from 'lucide-react'
import { appConfig } from '@/config/app'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'

export function CTA() {
  return (
    <section className="border-b border-border bg-primary">
      <Container>
        <div className="flex flex-col items-center py-16 text-center sm:py-20">
          <h2 className="max-w-2xl text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
            Ready to modernize your assessments?
          </h2>
          <p className="mt-4 max-w-xl text-lg text-primary-foreground/80">
            Join institutions that use {appConfig.APP_NAME} to deliver secure,
            scalable exams and meaningful learning insights.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="gap-2 bg-surface text-foreground hover:bg-surface/90"
            >
              Start free trial
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10"
            >
              Talk to sales
            </Button>
          </div>
        </div>
      </Container>
    </section>
  )
}
