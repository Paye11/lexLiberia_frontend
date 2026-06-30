'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { SectionHeading } from '@/components/section-heading'
import type { LegalUpdate } from '@/types'

export function LatestUpdates({ updates }: { updates: LegalUpdate[] }) {
  return (
    <section className="border-b border-border bg-sidebar">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Stay Informed"
          title="Latest Legal Updates"
          description="Recent laws, rulings, and regulatory changes across Liberia."
        />
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {updates.map((update, i) => (
            <motion.article
              key={update.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.35, delay: Math.min(i * 0.06, 0.3) }}
              className="group flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-3">
                <Badge>{update.category}</Badge>
                <time className="text-xs text-muted-foreground">
                  {new Date(update.publishedDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </time>
              </div>
              <h3 className="mt-3 font-heading text-lg font-semibold leading-snug text-balance">
                {update.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {update.description}
              </p>
              <button
                type="button"
                className="mt-4 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary"
              >
                Read More
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
