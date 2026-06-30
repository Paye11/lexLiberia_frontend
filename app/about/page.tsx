import type { Metadata } from 'next'
import Link from 'next/link'
import {
  BookMarked,
  Building2,
  GraduationCap,
  Scale,
  ShieldCheck,
  Target,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionHeading } from '@/components/section-heading'

export const metadata: Metadata = {
  title: 'About',
  description:
    'LexLiberia is a digital legal research platform making Liberian statutes and Supreme Court opinions accessible to everyone.',
}

const values = [
  {
    icon: Scale,
    title: 'Access to Justice',
    description:
      'We believe everyone deserves access to the laws that govern them, not just those who can afford private libraries.',
  },
  {
    icon: ShieldCheck,
    title: 'Accuracy & Trust',
    description:
      'Every document is sourced from official records and carefully verified before it is published on the platform.',
  },
  {
    icon: BookMarked,
    title: 'Open Knowledge',
    description:
      'We are committed to building the most complete, well-organized repository of Liberian legal materials.',
  },
]

const audiences = [
  { icon: Users, label: 'Practicing Lawyers' },
  { icon: GraduationCap, label: 'Law Students & Faculty' },
  { icon: Building2, label: 'Government & Institutions' },
  { icon: Scale, label: 'Judges & Magistrates' },
]

const stats = [
  { value: '12,000+', label: 'Legal documents' },
  { value: '500+', label: 'Supreme Court opinions' },
  { value: '24', label: 'Practice areas' },
  { value: '8,000+', label: 'Registered users' },
]

export default function AboutPage() {
  return (
    <>
        <section className="border-b border-border bg-accent/40">
          <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">
              Our Mission
            </p>
            <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-foreground text-balance sm:text-4xl md:text-5xl">
              Making Liberian law open, searchable, and understandable
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground text-pretty">
              LexLiberia brings together the Constitution, the Code of Laws,
              acts of the Legislature, and the opinions of the Supreme Court into
              a single, modern platform — augmented by AI so anyone can find the
              answer they need.
            </p>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden px-4 sm:px-6 md:grid-cols-4 lg:px-8">
            {stats.map((s) => (
              <div key={s.label} className="px-4 py-10 text-center">
                <p className="font-heading text-3xl font-bold text-primary">
                  {s.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="What we stand for"
              title="Our values"
              description="The principles that guide how we build and maintain LexLiberia."
            />
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {values.map((v) => {
                const Icon = v.icon
                return (
                  <div
                    key={v.title}
                    className="rounded-xl border border-border bg-card p-6 shadow-sm"
                  >
                    <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">
                      {v.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {v.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-muted/30 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Who we serve"
              title="Built for the legal community"
              description="From the courtroom to the classroom, LexLiberia supports every role."
            />
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {audiences.map((a) => {
                const Icon = a.icon
                return (
                  <div
                    key={a.label}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-5 shadow-sm"
                  >
                    <div className="flex size-10 items-center justify-center rounded-lg bg-secondary/15 text-secondary-foreground">
                      <Icon className="size-5 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {a.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-border bg-primary px-6 py-12 text-center text-primary-foreground sm:px-12">
              <Target className="mx-auto size-8" />
              <h2 className="mt-4 font-heading text-2xl font-bold text-balance sm:text-3xl">
                Join us in opening up Liberian law
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-primary-foreground/80 text-pretty">
                Create a free account to start searching statutes, reading
                opinions, and asking our AI research assistant.
              </p>
              <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  variant="secondary"
                  className="h-11 px-6"
                  render={<Link href="/register" />}
                >
                  Create free account
                </Button>
                <Button
                  variant="outline"
                  className="h-11 border-primary-foreground/30 bg-transparent px-6 text-primary-foreground hover:bg-primary-foreground/10"
                  render={<Link href="/contact" />}
                >
                  Contact us
                </Button>
              </div>
            </div>
          </div>
        </section>
    </>
  )
}
