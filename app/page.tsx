import Hero from '@/app/components/sections/Hero'
import Features from '@/app/components/sections/Features'
import HowItWorks from '@/app/components/sections/HowItWorks'
import UseCases from '@/app/components/sections/UseCases'
import Testimonials from '@/app/components/sections/Testimonials'
import Pricing from '@/app/components/sections/Pricing'
import CTA from '@/app/components/sections/CTA'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
      <HowItWorks />
      <UseCases />
      <Testimonials />
      <Pricing />
      <CTA />
    </main>
  )
}

