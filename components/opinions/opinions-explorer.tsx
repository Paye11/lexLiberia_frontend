'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { OpinionCard } from '@/components/cards/opinion-card'
import type { Opinion } from '@/types'

interface OpinionsExplorerProps {
  opinions: Opinion[]
}

type SortKey = 'newest' | 'oldest' | 'name'

export function OpinionsExplorer({ opinions }: OpinionsExplorerProps) {
  const [query, setQuery] = useState('')
  const [topic, setTopic] = useState<string>('All')
  const [sort, setSort] = useState<SortKey>('newest')

  const topics = useMemo(
    () => ['All', ...Array.from(new Set(opinions.map((o) => o.topic))).sort()],
    [opinions],
  )

  const filtered = useMemo(() => {
    let result = opinions.filter((o) => {
      const matchesQuery =
        !query ||
        o.caseName.toLowerCase().includes(query.toLowerCase()) ||
        o.citation.toLowerCase().includes(query.toLowerCase()) ||
        o.summary.toLowerCase().includes(query.toLowerCase()) ||
        o.justice.toLowerCase().includes(query.toLowerCase())
      const matchesTopic = topic === 'All' || o.topic === topic
      return matchesQuery && matchesTopic
    })

    result = [...result].sort((a, b) => {
      if (sort === 'name') return a.caseName.localeCompare(b.caseName)
      if (sort === 'oldest') return a.year - b.year
      return b.year - a.year
    })

    return result
  }, [opinions, query, topic, sort])

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cases, citations, or justices..."
            className="pl-10"
            aria-label="Search opinions"
          />
        </div>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-muted-foreground" />
          <label htmlFor="opinion-sort" className="sr-only">
            Sort opinions
          </label>
          <select
            id="opinion-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Case name (A–Z)</option>
          </select>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {topics.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTopic(t)}
            className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Badge variant={topic === t ? 'default' : 'outline'}>{t}</Badge>
          </button>
        ))}
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        Showing <span className="font-medium text-foreground">{filtered.length}</span>{' '}
        {filtered.length === 1 ? 'opinion' : 'opinions'}
      </p>

      {filtered.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
          {filtered.map((opinion, i) => (
            <motion.div
              key={opinion.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.3) }}
            >
              <OpinionCard opinion={opinion} />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-lg border border-dashed border-border py-16 text-center">
          <p className="font-heading text-lg font-semibold text-foreground">
            No opinions found
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search or topic filter.
          </p>
        </div>
      )}
    </section>
  )
}
