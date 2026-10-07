import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, CalendarDays, Eye, FileText, Tag } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { legalService } from '@/services/legal-service'
import { fetchDocument } from '@/lib/api-client'
import { LawDocumentViewer } from '@/components/laws/law-document-viewer-wrapper'
import { LawDetailDocumentActions } from '@/components/laws/law-detail-document-actions'

export const dynamic = 'force-dynamic'
export const dynamicParams = true

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

  let attachedDoc: Awaited<ReturnType<typeof fetchDocument>> | null = null
  if (law.documentId) {
    try {
      attachedDoc = await fetchDocument(law.documentId)
    } catch (err) {
      console.warn('[law-detail] failed to load attached document:', err)
    }
  }

  const locked = Boolean(attachedDoc?.locked ?? law.locked)

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
              {law.documentId ? (
                <Badge variant={locked ? 'destructive' : 'default'}>
                  {locked ? 'Locked' : 'Full Document Available'}
                </Badge>
              ) : null}
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

            <LawDetailDocumentActions
              lawId={law.id}
              lawTitle={law.title}
              documentId={law.documentId}
              locked={locked}
            />
          </div>
        </section>

        <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          {law.documentId && !locked && attachedDoc ? (
            <div className="mb-12">
              <h2 className="mb-4 font-heading text-lg font-semibold">
                Document Preview
              </h2>
              <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <LawDocumentViewer
                  documentId={law.documentId!}
                  fileType={attachedDoc.fileType || 'application/pdf'}
                  title={attachedDoc.title || law.title}
                />
              </div>
              <LawDetailDocumentActions
                lawId={law.id}
                lawTitle={law.title}
                documentId={law.documentId}
                locked={locked}
                compact
              />
            </div>
          ) : null}

          {law.content ? (
            <p className="text-base leading-relaxed text-foreground/90">
              {law.content}
            </p>
          ) : null}

          {law.sections?.length ? (
            <div className="mt-8 space-y-8">
              <h2 className="font-heading text-xl font-semibold">
                Key Sections
              </h2>
              {law.sections.map((section) => (
                <section
                  key={section.number}
                  className="border-l-2 border-secondary pl-5"
                >
                  <h3 className="font-heading text-lg font-semibold text-foreground">
                    <span className="font-mono text-secondary">
                      § {section.number}
                    </span>{' '}
                    {section.heading}
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                    {section.body}
                  </p>
                </section>
              ))}
            </div>
          ) : null}

          <div className="mt-12 rounded-lg border border-border bg-muted/40 p-6">
            <h3 className="font-heading text-base font-semibold text-foreground">
              Need deeper analysis, a draft, or a second opinion?
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Use AI Research (GPT-powered) or Ask Me (Perplexity Sonar) about this
              statute and related case law. Five advanced task modes are available
              on paid plans: Research, Draft, Review, Explain, and Compare — both
              cite Liberian authorities first.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button render={<Link href="/ai-research">AI Research</Link>} />
              <Button variant="outline" render={<Link href="/ask-me">Ask Me</Link>} />
            </div>
          </div>
        </article>
    </>
  )
}
