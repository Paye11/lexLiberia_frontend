import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, CalendarDays, Gavel, Scale } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { legalService } from '@/services/legal-service'
import { opinions } from '@/lib/mock-data'

export async function generateStaticParams() {
  return opinions.map((o) => ({ id: o.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const opinion = await legalService.getOpinionById(id)
  if (!opinion) return { title: 'Opinion not found' }
  return { title: opinion.caseName, description: opinion.summary }
}

function Block({ heading, body }: { heading: string; body?: string }) {
  if (!body) return null
  return (
    <section>
      <h2 className="font-heading text-lg font-semibold text-foreground">
        {heading}
      </h2>
      <p className="mt-2 text-base leading-relaxed text-muted-foreground">
        {body}
      </p>
    </section>
  )
}

export default async function OpinionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const opinion = await legalService.getOpinionById(id)
  if (!opinion) notFound()

  const formattedDate = new Date(opinion.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <>
      <div className="min-h-screen">
        <section className="border-b border-border bg-accent/40">
          <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
            <Button
              variant="ghost"
              size="sm"
              className="mb-6 -ml-2 text-muted-foreground"
              render={<Link href="/opinions" />}
            >
              <ArrowLeft className="size-4" />
              Back to Opinions
            </Button>
            <Badge variant="secondary">{opinion.topic}</Badge>
            <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground text-balance sm:text-4xl">
              {opinion.caseName}
            </h1>
            <p className="mt-2 font-mono text-sm text-primary">
              {opinion.citation}
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Gavel className="size-4 text-primary" />
                {opinion.justice}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4 text-primary" />
                {formattedDate}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Scale className="size-4 text-primary" />
                {opinion.topic}
              </span>
            </div>
          </div>
        </section>

        <article className="mx-auto max-w-4xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
          <Block heading="Summary" body={opinion.summary} />
          <Block heading="Facts" body={opinion.facts} />
          <Block heading="Issues" body={opinion.issues} />
          <div className="rounded-lg border-l-2 border-secondary bg-muted/40 p-5">
            <Block heading="Holding" body={opinion.holding} />
          </div>
          <Block heading="Opinion of the Court" body={opinion.opinion} />
        </article>
      </div>
    </>
  )
}
