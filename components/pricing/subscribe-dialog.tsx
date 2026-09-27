'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  fetchMyPaymentProof,
  fetchPayInstructions,
  getStoredToken,
  submitPaymentProof,
  type PayInstructions,
  type PaymentProof,
} from '@/lib/api-client'
import type { BillingCycle, Plan } from '@/types'

export function SubscribeDialog({
  plan,
  billing,
  onClose,
}: {
  plan: Plan
  billing: BillingCycle
  onClose: () => void
}) {
  const price = billing === 'monthly' ? plan.priceMonthly : plan.priceAnnual
  const [instructions, setInstructions] = useState<PayInstructions | null>(null)
  const [proof, setProof] = useState<PaymentProof | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchPayInstructions().then(setInstructions).catch(() => setInstructions(null))
    if (getStoredToken()) {
      fetchMyPaymentProof().then(setProof).catch(() => setProof(null))
    }
  }, [])

  async function copyNumber() {
    if (!instructions?.phone) return
    try {
      await navigator.clipboard.writeText(instructions.phone)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError('')

    if (!getStoredToken()) {
      window.location.href = '/login?next=/pricing'
      return
    }

    if (!file) {
      setError('Choose the screenshot from your phone first.')
      return
    }

    setSubmitting(true)
    try {
      const saved = await submitPaymentProof({
        planId: plan.id,
        billingCycle: billing,
        screenshot: file,
      })
      setProof(saved)
      setFile(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send the screenshot.')
    } finally {
      setSubmitting(false)
    }
  }

  const waiting = proof?.status === 'pending'
  const approved = proof?.status === 'approved'
  const payName = instructions?.name || 'Bill P. Alex'
  const payPhone = instructions?.phone || '0888907840'

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-black/50 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="subscribe-title"
        className="my-auto w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl"
      >
        <h2 id="subscribe-title" className="font-heading text-xl font-bold">
          Subscribe to {plan.name}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Send ${price} for {billing === 'monthly' ? 'one month' : 'one year'}. The plan opens after the admin confirms your screenshot.
        </p>

        <div className="mt-5 rounded-xl border border-border bg-muted/40 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Send Lonestar money to</p>
          <p className="mt-1 font-heading text-lg font-bold">{payName}</p>
          <p className="mt-1 font-mono text-2xl font-bold tracking-wide">{payPhone}</p>
          <Button type="button" variant="outline" className="mt-3" onClick={copyNumber}>
            {copied ? 'Number copied' : 'Copy number'}
          </Button>
        </div>

        <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Open Lonestar on your phone and send ${price} to {payPhone}.</li>
          <li>Take a screenshot of the sent message.</li>
          <li>Upload that screenshot here. The plan stays locked until the admin confirms it.</li>
        </ol>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {approved ? (
              <p className="text-sm text-success">
                Your last screenshot was confirmed. Send a new one only if you are paying for another period.
              </p>
            ) : null}
            {waiting ? (
              <p className="text-sm">
                Your screenshot is waiting. You can send a new one if the first was unclear.
              </p>
            ) : null}
            {proof?.status === 'rejected' ? (
              <p className="text-sm text-destructive">
                {proof.reviewNote || 'The last screenshot was not confirmed. Send the Lonestar message again.'}
              </p>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor={`shot-${plan.id}`}>Screenshot of the Lonestar message</Label>
              <input
                id={`shot-${plan.id}`}
                type="file"
                accept="image/*"
                capture="environment"
                className="block w-full text-sm"
                onChange={(event) => setFile(event.target.files?.[0] || null)}
              />
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Sending...
                  </>
                ) : waiting ? 'Send a new screenshot' : 'Send screenshot to admin'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
                Close
              </Button>
            </div>
          </form>
      </div>
    </div>
  )
}
