import { appConfig } from '@/config/app'
import { Button } from '@/components/ui/Button'

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6">
      <div className="max-w-xl w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground text-2xl font-bold shadow-lg">
          EF
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          {appConfig.APP_NAME}
        </h1>
        <p className="text-lg text-muted">
          {appConfig.APP_TAGLINE}
        </p>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {appConfig.APP_DESCRIPTION}
        </p>
        <div className="pt-4 flex flex-wrap gap-3 justify-center">
          <span className="inline-flex items-center rounded-full bg-primary-muted px-3 py-1 text-xs font-medium text-primary">
            Phase 1 — Project Initialization
          </span>
          <span className="inline-flex items-center rounded-full bg-success-muted px-3 py-1 text-xs font-medium text-success">
            Design Tokens Ready
          </span>
        </div>
        <div className="pt-6 flex flex-wrap gap-3 justify-center">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </div>
    </div>
  )
}

export default App
