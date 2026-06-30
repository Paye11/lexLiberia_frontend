'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { FileSearch, Search, SlidersHorizontal, X } from 'lucide-react'
import { LawCard } from '@/components/cards/law-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Category, Law } from '@/types'

type SortKey = 'newest' | 'oldest' | 'views'

const docTypes = ['Constitution', 'Statute', 'Regulation', 'Executive Order']

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  )
}

const selectClass =
  'h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground shadow-sm focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none'

export function LawsExplorer({
  laws,
  categories,
}: {
  laws: Law[]
  categories: Category[]
}) {
  const params = useSearchParams()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [type, setType] = useState('all')
  const [year, setYear] = useState('all')
  const [sort, setSort] = useState<SortKey>('newest')
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    setQuery(params.get('q') ?? '')
    setCategory(params.get('category') ?? 'all')
  }, [params])

  const years = useMemo(
    () => [...new Set(laws.map((l) => l.year))].sort((a, b) => b - a),
    [laws],
  )

  const results = useMemo(() => {
    let list = laws.filter((law) => {
      const q = query.trim().toLowerCase()
      const matchesQuery =
        !q ||
        law.title.toLowerCase().includes(q) ||
        law.summary.toLowerCase().includes(q) ||
        law.category.toLowerCase().includes(q)
      const matchesCategory =
        category === 'all' || law.categorySlug === category
      const matchesType = type === 'all' || law.type === type
      const matchesYear = year === 'all' || String(law.year) === year
      return matchesQuery && matchesCategory && matchesType && matchesYear
    })

    list = [...list].sort((a, b) => {
      if (sort === 'views') return b.views - a.views
      const da = new Date(a.publishedDate).getTime()
      const db = new Date(b.publishedDate).getTime()
      return sort === 'newest' ? db - da : da - db
    })
    return list
  }, [laws, query, category, type, year, sort])

  const activeFilters =
    (category !== 'all' ? 1 : 0) +
    (type !== 'all' ? 1 : 0) +
    (year !== 'all' ? 1 : 0)

  function reset() {
    setCategory('all')
    setType('all')
    setYear('all')
    setQuery('')
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      {/* Filters */}
      <aside
        className={`${filtersOpen ? 'block' : 'hidden'} lg:block`}
        aria-label="Filters"
      >
        <div className="rounded-xl border border-border bg-card p-5 lg:sticky lg:top-24">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-sm font-semibold">
              Advanced Filters
            </h2>
            {activeFilters > 0 && (
              <button
                type="button"
                onClick={reset}
                className="text-xs font-medium text-primary"
              >
                Clear
              </button>
            )}
          </div>
          <div className="space-y-4">
            <Field label="Category">
              <select
                className={selectClass}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="all">All categories</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.title}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Document Type">
              <select
                className={selectClass}
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="all">All types</option>
                {docTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Year">
              <select
                className={selectClass}
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                <option value="all">All years</option>
                {years.map((y) => (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>
      </aside>

      {/* Results */}
      <div>
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by law title, keyword, section number, case name..."
            aria-label="Search laws"
            className="h-12 w-full rounded-lg border border-border bg-background pl-11 pr-4 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
          />
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {results.length}
            </span>{' '}
            {results.length === 1 ? 'result' : 'results'}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 lg:hidden"
              onClick={() => setFiltersOpen((o) => !o)}
            >
              <SlidersHorizontal className="size-4" />
              Filters
              {activeFilters > 0 && (
                <Badge className="ml-1 px-1.5">{activeFilters}</Badge>
              )}
            </Button>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Sort by</span>
              <select
                className="h-9 rounded-lg border border-border bg-background px-3 text-sm shadow-sm focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="views">Most Viewed</option>
              </select>
            </label>
          </div>
        </div>

        {results.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2">
            {results.map((law, i) => (
              <LawCard key={law.id} law={law} index={i} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
            <FileSearch className="size-10 text-muted-foreground" />
            <h3 className="mt-4 font-heading text-lg font-semibold">
              No documents found
            </h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Try adjusting your search terms or clearing the filters.
            </p>
            <Button variant="outline" className="mt-4 gap-1.5" onClick={reset}>
              <X className="size-4" />
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
