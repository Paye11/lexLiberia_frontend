import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, CalendarDays, Eye, FileText, Tag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { legalService } from '@/services/legal-service'
import { laws } from '@/lib/mock-data'

export async function generateStaticParams() {
  return laws.map((law) => ({ id: law.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const law = await legalService.getLawById(id)
  if (!law) return { title: 'Law not found' }
  return { title: law.title, description: law.summary }
}

export default async function LawDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const law = await legalService.getLawById(id)
  if (!law) notFound()

  const formattedDate = new Date(law.publishedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <>
        <section className="border-b border-border bg-accent/40">
          <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
            <Button
              variant="ghost"
              size="sm"
              className="mb-6 -ml-2 text-muted-foreground"
              render={<Link href="/laws" />}
            >
              <ArrowLeft className="size-4" />
              Back to Laws
            </Button>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{law.type}</Badge>
              <Badge variant="outline">{law.category}</Badge>
            </div>
            <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground text-balance sm:text-4xl">
              {law.title}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              {law.summary}
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4 text-primary" />
                {formattedDate}
              </span>
              {law.chapter ? (
                <span className="inline-flex items-center gap-1.5">
                  <FileText className="size-4 text-primary" />
                  {law.chapter}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5">
                <Tag className="size-4 text-primary" />
                {law.category}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Eye className="size-4 text-primary" />
                {law.views.toLocaleString()} views
              </span>
            </div>
          </div>
        </section>

        <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          {law.content ? (
            <p className="text-base leading-relaxed text-foreground/90">
              {law.content}
            </p>
          ) : null}

          {law.sections?.length ? (
            <div className="mt-8 space-y-8">
              {law.sections.map((section) => (
                <section
                  key={section.number}
                  className="border-l-2 border-secondary pl-5"
                >
                  <h2 className="font-heading text-lg font-semibold text-foreground">
                    <span className="font-mono text-secondary">
                      § {section.number}
                    </span>{' '}
                    {section.heading}
                  </h2>
                  <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                    {section.body}
                  </p>
                </section>
              ))}
            </div>
          ) : null}

          <div className="mt-12 rounded-lg border border-border bg-muted/40 p-6">
            <h3 className="font-heading text-base font-semibold text-foreground">
              Need deeper analysis?
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Use our AI Legal Research assistant to ask questions about this
              statute and find related case law.
            </p>
            <Button
              className="mt-4"
              render={<Link href="/ai-research">Ask the AI Assistant</Link>}
            />
          </div>
        </article>
    </>
  )
}
