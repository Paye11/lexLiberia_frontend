'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  fetchMomoConfig,
  getMomoPaymentStatus,
  getStoredToken,
  startMomoPayment,
  type MomoConfig,
  type MomoPaymentState,
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
  const [phone, setPhone] = useState('')
  const [config, setConfig] = useState<MomoConfig | null>(null)
  const [state, setState] = useState<MomoPaymentState | null>(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    fetchMomoConfig()
      .then(setConfig)
      .catch(() => setConfig(null))
  }, [])

  useEffect(() => {
    if (!state || state.status !== 'pending') return

    let stopped = false
    const startedAt = Date.now()
    const timer = window.setInterval(async () => {
      if (Date.now() - startedAt > 120000) {
        window.clearInterval(timer)
        if (!stopped) {
          setTimedOut(true)
          setError('Still waiting for approval. If no prompt appeared, try again with the test number.')
        }
        return
      }

      try {
        const next = await getMomoPaymentStatus(state.paymentId)
        if (stopped) return
        setState(next)
        if (next.status !== 'pending') {
          window.clearInterval(timer)
        }
      } catch (err) {
        if (stopped) return
        setError(err instanceof Error ? err.message : 'Unable to check the payment.')
      }
    }, 3000)

    return () => {
      stopped = true
      window.clearInterval(timer)
    }
  }, [state?.paymentId, state?.status])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError('')

    if (!getStoredToken()) {
      window.location.href = '/login?next=/pricing'
      return
    }

    setSubmitting(true)
    setTimedOut(false)
    try {
      const started = await startMomoPayment({
        planId: plan.id,
        billingCycle: billing,
        phone,
      })
      setState(started)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start the payment.')
    } finally {
      setSubmitting(false)
    }
  }

  const waiting = state?.status === 'pending' && !timedOut
  const succeeded = state?.status === 'completed'
  const failed = state?.status === 'failed'

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="subscribe-title"
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl"
      >
        <h2 id="subscribe-title" className="font-heading text-xl font-bold">
          Subscribe to {plan.name}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          ${price} / {billing === 'monthly' ? 'month' : 'year'}, collected with Lonestar mobile money.
        </p>

        {succeeded ? (
          <div className="mt-5 space-y-4">
            <p className="text-sm text-success">{state.message}</p>
            <div className="flex flex-wrap gap-2">
              <Button render={<Link href="/account" />}>View account</Button>
              <Button variant="outline" render={<Link href="/ai-research" />}>
                Open AI Research
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`phone-${plan.id}`}>Lonestar number</Label>
              <Input
                id={`phone-${plan.id}`}
                autoFocus
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder={config?.mode === 'sandbox' ? config.testPhone || '56733123453' : '0886123456'}
                disabled={waiting || submitting}
                required
              />
            </div>

            {config?.mode === 'sandbox' ? (
              <p className="text-sm text-muted-foreground">
                This is a test payment. No real money moves. Enter{' '}
                <span className="font-medium text-foreground">{config.testPhone}</span>{' '}
                and MTN will approve it. Your real Lonestar number starts working after MTN turns on live collections.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                A prompt will appear on that phone. The plan turns on only after you approve it.
              </p>
            )}

            {waiting ? (
              <p className="flex items-center gap-2 text-sm">
                <Loader2 className="size-4 animate-spin" />
                {state.message} Keep this window open.
              </p>
            ) : null}

            {failed ? <p className="text-sm text-destructive">{state.message}</p> : null}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={submitting || waiting}>
                {submitting ? 'Sending...' : failed ? 'Try again' : 'Send payment request'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
                {waiting ? 'Close' : 'Cancel'}
              </Button>
            </div>
          </form>
        )}

        {succeeded ? (
          <Button type="button" variant="outline" className="mt-4" onClick={onClose}>
            Close
          </Button>
        ) : null}
      </div>
    </div>
  )
}
