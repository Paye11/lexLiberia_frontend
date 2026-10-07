'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Bookmark, Eye, Calendar, ArrowUpRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Law } from '@/types'
import { openDocumentFile } from '@/lib/api-client'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function LawCard({ law, index = 0 }: { law: Law; index?: number }) {
  const [bookmarked, setBookmarked] = useState(false)

  async function handleOpenDirect(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (law.documentId) {
      try {
        await openDocumentFile(law.documentId)
        return
      } catch (err) {
        console.warn('Direct open failed, falling back to detail page', err)
      }
    }
    window.location.href = `/laws/${encodeURIComponent(law.id)}`
  }

  return (
    <Link
      href={`/laws/${encodeURIComponent(law.id)}`}
      className="group flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md no-underline text-inherit"
    >
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.25) }}
        className="flex h-full flex-col"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{law.category}</Badge>
            <Badge variant="muted">{law.type}</Badge>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setBookmarked((b) => !b)
            }}
            aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
            className="text-muted-foreground transition-colors hover:text-secondary"
          >
            <Bookmark
              className={`size-5 ${bookmarked ? 'fill-secondary text-secondary' : ''}`}
            />
          </button>
        </div>

        <h3 className="mt-3 font-heading text-base font-semibold leading-snug text-balance group-hover:text-primary transition-colors">
          {law.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {law.summary}
        </p>

        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="size-3.5" />
            {formatDate(law.publishedDate)}
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="size-3.5" />
            {law.views.toLocaleString()} views
          </span>
        </div>

        <div className="mt-4 border-t border-border pt-4">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-full"
            onClick={handleOpenDirect}
          >
            View Document
            <ArrowUpRight className="ml-1.5 size-3.5" />
          </Button>
        </div>
      </motion.article>
    </Link>
  )
}
