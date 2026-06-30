'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { SectionHeading } from '@/components/section-heading'
import { Button } from '@/components/ui/button'
import type { Testimonial } from '@/types'

export function Testimonials({
  testimonials,
}: {
  testimonials: Testimonial[]
}) {
  const [index, setIndex] = useState(0)
  const count = testimonials.length

  const go = (dir: number) => setIndex((i) => (i + dir + count) % count)
  const current = testimonials[index]

  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Quotes"
          title="Words of wisdom on justice"
        />

        <div className="relative mt-12">
          <Quote className="mx-auto size-10 text-secondary" />
          <div className="mt-6 min-h-44">
            <AnimatePresence mode="wait">
              <motion.figure
                key={current.id}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.35 }}
                className="text-center"
              >
                <blockquote className="font-heading text-xl font-medium leading-relaxed text-balance sm:text-2xl">
                  &ldquo;{current.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6">
                  <p className="font-semibold">{current.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {current.role}, {current.institution}
                  </p>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>

          <div className="mt-8 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              aria-label="Previous quote"
              onClick={() => go(-1)}
            >
              <ChevronLeft className="size-5" />
            </Button>
            <div className="flex gap-2">
              {testimonials.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  aria-label={`Go to quote ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`size-2 rounded-full transition-colors ${
                    i === index ? 'bg-primary' : 'bg-border'
                  }`}
                />
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              aria-label="Next quote"
              onClick={() => go(1)}
            >
              <ChevronRight className="size-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
