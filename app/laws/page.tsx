import { Suspense } from 'react'
import type { Metadata } from 'next'
import { LawsExplorer } from '@/components/laws/laws-explorer'
import { PremiumDocuments } from '@/components/documents/premium-documents'
import { legalService } from '@/services/legal-service'

export const metadata: Metadata = {
  title: 'Laws & Statutes',
  description:
    'Browse and search the Liberian Code of Laws, statutes, acts, and regulations by category, year, and status.',
}

export default async function LawsPage() {
  const [laws, categories] = await Promise.all([
    legalService.getLaws(),
    legalService.getCategories(),
  ])

  return (
    <>
        <section className="border-b border-border bg-accent/40">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">
              Legal Library
            </p>
            <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground text-balance sm:text-4xl">
              Laws &amp; Statutes
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Explore the consolidated Liberian Code of Laws, acts of the
              Legislature, and subsidiary regulations. Filter by category, year,
              and status to find exactly what you need.
            </p>
          </div>
        </section>
        <Suspense fallback={null}>
          <LawsExplorer laws={laws} categories={categories} />
        </Suspense>

        <section className="border-t border-border bg-muted/20 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">
              Premium Library
            </p>
            <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight">
              Admin-uploaded documents
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              These PDF and Word files are uploaded by LexLiberia admins and available to paid accounts. Free users can see titles but need to upgrade or redeem a coupon to view.
            </p>
            <div className="mt-8">
              <PremiumDocuments />
            </div>
          </div>
        </section>
    </>
  )
}
