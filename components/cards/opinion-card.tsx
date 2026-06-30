'use client'

import { motion } from 'framer-motion'
import { Calendar, Gavel, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Opinion } from '@/types'

export function OpinionCard({
  opinion,
  index = 0,
}: {
  opinion: Opinion
  index?: number
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.25) }}
      className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="gold">{opinion.topic}</Badge>
        <span className="font-mono text-xs text-muted-foreground">
          {opinion.citation}
        </span>
      </div>

      <h3 className="mt-3 font-heading text-base font-semibold italic leading-snug text-balance">
        {opinion.caseName}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
        {opinion.summary}
      </p>

      <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <User className="size-3.5" />
          {opinion.justice}
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar className="size-3.5" />
          {new Date(opinion.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </span>
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <Button variant="outline" size="sm" className="h-8 w-full gap-1.5">
          <Gavel className="size-3.5" />
          Read Opinion
        </Button>
      </div>
    </motion.article>
  )
}
