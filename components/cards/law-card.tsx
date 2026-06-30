'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bookmark, Eye, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Law } from '@/types'

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function LawCard({ law, index = 0 }: { law: Law; index?: number }) {
  const [bookmarked, setBookmarked] = useState(false)

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.25) }}
      className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{law.category}</Badge>
          <Badge variant="muted">{law.type}</Badge>
        </div>
        <button
          type="button"
          onClick={() => setBookmarked((b) => !b)}
          aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
          className="text-muted-foreground transition-colors hover:text-secondary"
        >
          <Bookmark
            className={`size-5 ${bookmarked ? 'fill-secondary text-secondary' : ''}`}
          />
        </button>
      </div>

      <h3 className="mt-3 font-heading text-base font-semibold leading-snug text-balance">
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
        <Button variant="outline" size="sm" className="h-8 w-full">
          View Document
        </Button>
      </div>
    </motion.article>
  )
}
