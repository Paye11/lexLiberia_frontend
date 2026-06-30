'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function Newsletter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  return (
    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary-foreground/10">
            <Mail className="size-6" />
          </span>
          <h2 className="mt-5 font-heading text-3xl font-bold tracking-tight text-balance">
            Stay ahead of legal developments
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/80">
            Subscribe to receive new laws, Supreme Court opinions, and
            regulatory updates straight to your inbox.
          </p>

          {submitted ? (
            <div className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary-foreground/10 px-4 py-3 text-sm font-medium">
              <CheckCircle2 className="size-5 text-secondary" />
              Thank you for subscribing!
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (email.trim()) setSubmitted(true)
              }}
              className="mx-auto mt-8 flex max-w-md flex-col gap-2 sm:flex-row"
            >
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-label="Email address"
                className="h-11 border-transparent bg-primary-foreground text-foreground"
              />
              <Button
                type="submit"
                variant="secondary"
                className="h-11 px-6 font-semibold"
              >
                Subscribe
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  )
}
