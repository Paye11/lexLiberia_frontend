import type { Metadata } from 'next'
import { PlansSection } from '@/components/pricing/plans-section'
import { FaqAccordion } from '@/components/faq-accordion'
import { SectionHeading } from '@/components/section-heading'
import { legalService } from '@/services/legal-service'
import { faqs as fallbackFaqs, plans as fallbackPlans } from '@/lib/mock-data'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Simple, transparent pricing for legal professionals, students, and institutions. Choose the LexLiberia plan that fits your needs.',
}

function ensureArray<T>(value: unknown, fallback: readonly T[]): T[] {
  return Array.isArray(value) ? (value as T[]) : (fallback as T[])
}

export default async function PricingPage() {
  const [plans, faqs] = await Promise.all([
    legalService.getPlans().catch(() => fallbackPlans),
    legalService.getFaqs().catch(() => fallbackFaqs),
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
              Start free and upgrade as your research needs grow. Paid plans unlock
              premium documents, AI Research + Ask Me with five task modes
              (Research, Draft, Review, Explain, Compare), full-text search,
              citations, export, and priority support.
            </p>
          </div>
        </section>

        <PlansSection plans={ensureArray(plans, fallbackPlans)} showHeading={false} />

        <section className="border-t border-border bg-muted/30 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="FAQ"
              title="Frequently asked questions"
              description="Everything you need to know about plans, billing, and access."
              align="center"
            />
            <div className="mt-10">
              <FaqAccordion items={ensureArray(faqs, fallbackFaqs)} />
            </div>
          </div>
        </section>
    </>
  )
}
