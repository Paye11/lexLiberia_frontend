'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  approvePaymentProof,
  enableAdminPush,
  fetchPaymentProofImage,
  fetchPaymentProofs,
  fetchPlans,
  rejectPaymentProof,
  type PaymentProof,
} from '@/lib/api-client'

interface PlanChoice {
  _id: string
  name: string
  priceMonthly?: number
  priceAnnual?: number
}

export default function AdminPaymentsPage() {
  const [proofs, setProofs] = useState<PaymentProof[]>([])
  const [plans, setPlans] = useState<PlanChoice[]>([])
  const [choices, setChoices] = useState<Record<string, { planId: string; billingCycle: 'monthly' | 'annual' }>>({})
  const [images, setImages] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState('')
  const [alertMessage, setAlertMessage] = useState('')
  const imageUrls = useRef<string[]>([])

  async function load() {
    const [proofData, planData] = await Promise.all([
      fetchPaymentProofs('pending'),
      fetchPlans(),
    ])
    const paidPlans = (planData as PlanChoice[]).filter((plan) => plan.name !== 'Free')
    setPlans(paidPlans)
    setProofs(proofData)
    setChoices((current) => {
      const next = { ...current }
      proofData.forEach((proof) => {
        if (!next[proof._id]) {
          next[proof._id] = {
            planId: proof.plan?._id || paidPlans[0]?._id || '',
            billingCycle: proof.billingCycle,
          }
        }
      })
      return next
    })

    const loaded: Record<string, string> = {}
    await Promise.all(proofData.map(async (proof) => {
      try {
        loaded[proof._id] = await fetchPaymentProofImage(proof._id)
      } catch {
        loaded[proof._id] = ''
      }
    }))
    imageUrls.current.forEach((url) => URL.revokeObjectURL(url))
    imageUrls.current = Object.values(loaded).filter(Boolean)
    setImages(loaded)
  }

  useEffect(() => {
    load()
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load payments.'))
      .finally(() => setLoading(false))

    return () => {
      imageUrls.current.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  async function confirmProof(proofId: string) {
    const choice = choices[proofId]
    if (!choice?.planId) {
      setError('Choose the plan to open.')
      return
    }
    setBusyId(proofId)
    setError('')
    try {
      await approvePaymentProof(proofId, choice)
      setProofs((current) => current.filter((proof) => proof._id !== proofId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to confirm this payment.')
    } finally {
      setBusyId('')
    }
  }

  async function declineProof(proofId: string) {
    setBusyId(proofId)
    setError('')
    try {
      await rejectPaymentProof(proofId)
      setProofs((current) => current.filter((proof) => proof._id !== proofId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reject this payment.')
    } finally {
      setBusyId('')
    }
  }

  async function turnOnAlerts() {
    setAlertMessage('')
    try {
      const background = await enableAdminPush()
      setAlertMessage(
        background
          ? 'This phone will be alerted when a screenshot arrives, even if the app is closed.'
          : 'Alerts are on while the admin app is open. After the server alert keys are saved, closed-app alerts will work too.',
      )
    } catch (err) {
      setAlertMessage(err instanceof Error ? err.message : 'Unable to turn on alerts.')
    }
  }

  return (
    <section className="py-10">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-3xl font-bold">Payments to confirm</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Compare each screenshot with the Lonestar message on your phone, then choose the plan to open.
            </p>
          </div>
          <Button variant="outline" render={<Link href="/admin/dashboard" />}>
            Dashboard
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
            <p className="text-sm text-muted-foreground">
              Alerts go to this phone when someone sends a screenshot.
            </p>
            <Button onClick={turnOnAlerts}>Turn on phone alerts</Button>
          </CardContent>
          {alertMessage ? <p className="px-6 pb-6 text-sm">{alertMessage}</p> : null}
        </Card>

        {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}

        {loading ? (
          <Loader2 className="size-8 animate-spin text-primary" />
        ) : proofs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No screenshots are waiting.</p>
        ) : (
          <div className="space-y-6">
            {proofs.map((proof) => {
              const choice = choices[proof._id]
              return (
                <Card key={proof._id}>
                  <CardHeader>
                    <CardTitle>{proof.user?.name || 'Subscriber'}</CardTitle>
                    <CardDescription>
                      {proof.user?.email} · asked for {proof.plan?.name} · ${proof.amount}{' '}
                      {proof.billingCycle === 'annual' ? 'per year' : 'per month'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {images[proof._id] ? (
                      <img
                        src={images[proof._id]}
                        alt={`Lonestar screenshot from ${proof.user?.name || 'subscriber'}`}
                        className="w-full rounded-lg border border-border"
                      />
                    ) : (
                      <p className="text-sm text-destructive">The screenshot could not be loaded.</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Sent {new Date(proof.updatedAt || proof.createdAt).toLocaleString()}
                    </p>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="text-sm">
                        Plan to open
                        <select
                          className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3"
                          value={choice?.planId || ''}
                          onChange={(event) => setChoices((current) => ({
                            ...current,
                            [proof._id]: { ...choice, planId: event.target.value, billingCycle: choice?.billingCycle || proof.billingCycle },
                          }))}
                        >
                          {plans.map((plan) => (
                            <option key={plan._id} value={plan._id}>
                              {plan.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="text-sm">
                        Length
                        <select
                          className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3"
                          value={choice?.billingCycle || proof.billingCycle}
                          onChange={(event) => setChoices((current) => ({
                            ...current,
                            [proof._id]: {
                              planId: choice?.planId || proof.plan?._id || '',
                              billingCycle: event.target.value as 'monthly' | 'annual',
                            },
                          }))}
                        >
                          <option value="monthly">Monthly</option>
                          <option value="annual">Annual</option>
                        </select>
                      </label>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button onClick={() => confirmProof(proof._id)} disabled={busyId === proof._id}>
                        {busyId === proof._id ? 'Saving...' : 'Confirm and open plan'}
                      </Button>
                      <Button variant="outline" onClick={() => declineProof(proof._id)} disabled={busyId === proof._id}>
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
