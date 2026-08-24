import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { Features } from '@/components/landing/Features'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { Pricing } from '@/components/landing/Pricing'
import { LandingSections } from '@/components/landing/LandingSections'
import { Footer } from '@/components/landing/Footer'

/**
 * Public marketing page at `/` — available to guests AND signed-in users.
 * No auth required. Signed-in users still see Dashboard in the navbar.
 */
export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-mesh">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <LandingSections />
        <Pricing />
      </main>
      <Footer />
    </div>
  )
}
