'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

const suggestions = [
  'Bail bond',
  'Contempt of court',
  'Land Rights Act',
  'Decent Work Act',
  'Due process',
  'Lis pendens',
]

export function QuickSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  function submit(value: string) {
    const q = value.trim()
    router.push(q ? `/laws?q=${encodeURIComponent(q)}` : '/laws')
  }

  return (
    <section className="border-b border-border bg-card">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <h2 className="font-heading text-2xl font-bold tracking-tight">
            Start your legal research
          </h2>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              submit(query)
            }}
            role="search"
            className="mt-6 flex flex-col gap-2 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by law title, keyword, section number, case name..."
                aria-label="Search legal materials"
                className="h-12 w-full rounded-lg border border-border bg-background pl-11 pr-4 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
              />
            </div>
            <Button type="submit" className="h-12 px-6">
              Search
            </Button>
          </form>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-muted-foreground">Popular:</span>
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => submit(s)}
                className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                {s}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
