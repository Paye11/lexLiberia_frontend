'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const subjects = [
  'General enquiry',
  'Subscription & billing',
  'Report a document error',
  'Partnership',
  'Technical support',
]

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    // Replace with a POST to your backend / a server action.
    await new Promise((r) => setTimeout(r, 900))
    setStatus('sent')
  }

  if (status === 'sent') {
    return (
      <div className="flex flex-col items-center rounded-xl border border-border bg-card p-10 text-center shadow-sm">
        <div className="flex size-12 items-center justify-center rounded-full bg-success/12 text-success">
          <CheckCircle2 className="size-6" />
        </div>
        <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">
          Message sent
        </h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Thank you for reaching out. Our team will get back to you within two
          business days.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => setStatus('idle')}
        >
          Send another message
        </Button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">
            Full name
          </span>
          <Input required name="name" placeholder="Jane Cooper" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-foreground">
            Email
          </span>
          <Input
            required
            type="email"
            name="email"
            placeholder="jane@example.com"
          />
        </label>
      </div>

      <label className="mt-5 block">
        <span className="mb-1.5 block text-sm font-medium text-foreground">
          Subject
        </span>
        <select
          name="subject"
          required
          defaultValue=""
          className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground shadow-sm focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
        >
          <option value="" disabled>
            Select a subject
          </option>
          {subjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-5 block">
        <span className="mb-1.5 block text-sm font-medium text-foreground">
          Message
        </span>
        <Textarea
          required
          name="message"
          rows={5}
          placeholder="How can we help you?"
        />
      </label>

      <Button
        type="submit"
        className="mt-6 h-11 w-full"
        disabled={status === 'sending'}
      >
        {status === 'sending' ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Sending...
          </>
        ) : (
          'Send message'
        )}
      </Button>
    </form>
  )
}
