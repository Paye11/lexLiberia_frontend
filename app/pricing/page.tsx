import type { Metadata } from 'next'
import { PlansSection } from '@/components/pricing/plans-section'
import { FaqAccordion } from '@/components/faq-accordion'
import { SectionHeading } from '@/components/section-heading'
import { legalService } from '@/services/legal-service'

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Simple, transparent pricing for legal professionals, students, and institutions. Choose the LexLiberia plan that fits your needs.',
}

export default async function PricingPage() {
  const [plans, faqs] = await Promise.all([
    legalService.getPlans(),
    legalService.getFaqs(),
  ])

  return (
    <>
        <section className="border-b border-border bg-accent/40">
          <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 lg:px-8">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">
              Pricing
            </p>
            <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground text-balance sm:text-4xl">
              Plans for every legal professional
            </h1>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground text-pretty">
              Start free and upgrade as your research needs grow. All paid plans
              include AI research, full-text search, and citation tools.
            </p>
          </div>
        </section>

        <PlansSection plans={plans} showHeading={false} />

        <section className="border-t border-border bg-muted/30 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="FAQ"
              title="Frequently asked questions"
              description="Everything you need to know about plans, billing, and access."
              align="center"
            />
            <div className="mt-10">
              <FaqAccordion items={faqs} />
            </div>
          </div>
        </section>
    </>
  )
}
