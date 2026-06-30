'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { BookOpen, Search, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const stats = [
  { value: '12,400+', label: 'Legal Documents' },
  { value: '1,240+', label: 'Court Opinions' },
  { value: '14', label: 'Practice Areas' },
]

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center opacity-[0.06] dark:opacity-[0.12]"
        style={{ backgroundImage: "url('/images/hero-courthouse.png')" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-accent/40 to-background" aria-hidden="true" />

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="gold" className="mb-5">
            <ShieldCheck className="size-3.5" />
            Trusted Liberian Legal Research
          </Badge>
          <h1 className="font-heading text-4xl font-extrabold leading-[1.1] tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Research Liberian Laws with{' '}
            <span className="text-primary">Confidence</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
            Search laws, Supreme Court opinions, regulations, executive orders,
            and legal materials from one trusted platform.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button className="h-11 px-5 text-sm" render={<Link href="/laws" />}>
              <Search className="size-4" />
              Search Laws
            </Button>
            <Button
              variant="outline"
              className="h-11 px-5 text-sm"
              render={<Link href="/laws" />}
            >
              <BookOpen className="size-4" />
              View Library
            </Button>
          </div>

          <dl className="mt-12 grid max-w-md grid-cols-3 gap-6">
            {stats.map((s) => (
              <div key={s.label}>
                <dt className="font-heading text-2xl font-bold text-primary">
                  {s.value}
                </dt>
                <dd className="mt-1 text-xs text-muted-foreground">
                  {s.label}
                </dd>
              </div>
            ))}
          </dl>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative hidden lg:block"
        >
          <div className="overflow-hidden rounded-2xl border border-border shadow-xl">
            <img
              src="/images/hero-courthouse.png"
              alt="Illustration of a Liberian courthouse representing the rule of law"
              className="h-full w-full object-cover"
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
