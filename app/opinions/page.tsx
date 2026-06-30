import type { Metadata } from 'next'
import { OpinionsExplorer } from '@/components/opinions/opinions-explorer'
import { legalService } from '@/services/legal-service'

export const metadata: Metadata = {
  title: 'Supreme Court Opinions',
  description:
    'Read landmark and recent opinions of the Supreme Court of Liberia, searchable by case name, citation, justice, and topic.',
}

export default async function OpinionsPage() {
  const opinions = await legalService.getOpinions()

  return (
    <>
        <section className="border-b border-border bg-accent/40">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">
              Case Law
            </p>
            <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground text-balance sm:text-4xl">
              Supreme Court Opinions
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
              Browse opinions of the Supreme Court of Liberia. Each entry
              includes the citation, authoring justice, and a concise summary of
              the holding.
            </p>
          </div>
        </section>
        <OpinionsExplorer opinions={opinions} />
    </>
  )
}
