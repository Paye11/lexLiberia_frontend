'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { CategoryIcon } from '@/components/category-icon'
import type { Category } from '@/types'

export function CategoryCard({
  category,
  index = 0,
}: {
  category: Category
  index?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
    >
      <Link
        href={`/laws?category=${category.slug}`}
        className="group flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
      >
        <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <CategoryIcon name={category.icon} className="size-5" />
        </span>
        <h3 className="mt-4 font-heading text-base font-semibold">
          {category.title}
        </h3>
        <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
          {category.description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            {category.documentCount.toLocaleString()} documents
          </span>
          <ArrowRight className="size-4 text-primary opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
        </div>
      </Link>
    </motion.div>
  )
}
