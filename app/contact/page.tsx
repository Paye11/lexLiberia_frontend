import type { Metadata } from 'next'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { ContactForm } from '@/components/contact/contact-form'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with the LexLiberia team for support, partnerships, or to report a document error.',
}

const details = [
  {
    icon: Mail,
    label: 'Email',
    value: 'payealex896@gmail.com',
    href: 'mailto:payealex896@gmail.com',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+231888907840',
    href: 'tel:+231888907840',
  },
  {
    icon: MapPin,
    label: 'Office',
    value: 'Sanniquellie City, Nimba County, Liberia',
  },
  {
    icon: Clock,
    label: 'Hours',
    value: '24/7',
  },
]

export default function ContactPage() {
  return (
    <>
        <section className="border-b border-border bg-accent/40">
          <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:px-6 lg:px-8">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">
              Contact
            </p>
            <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground text-balance sm:text-4xl">
              Get in touch
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-muted-foreground text-pretty">
              Questions, feedback, or a correction to report? We would love to
              hear from you.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
            <div className="lg:col-span-1">
              <h2 className="font-heading text-lg font-semibold text-foreground">
                Contact details
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Reach the LexLiberia team through any of the channels below.
              </p>
              <ul className="mt-6 space-y-5">
                {details.map((d) => {
                  const Icon = d.icon
                  const content = (
                    <div className="flex items-start gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {d.label}
                        </p>
                        <p className="mt-0.5 text-sm font-medium text-foreground">
                          {d.value}
                        </p>
                      </div>
                    </div>
                  )
                  return (
                    <li key={d.label}>
                      {d.href ? (
                        <a
                          href={d.href}
                          className="block rounded-lg outline-none transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {content}
                        </a>
                      ) : (
                        content
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="lg:col-span-2">
              <ContactForm />
            </div>
          </div>
        </section>
    </>
  )
}
