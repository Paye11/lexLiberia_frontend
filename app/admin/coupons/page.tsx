'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Ticket, Trash2 } from 'lucide-react'
import {
  createCoupon,
  deactivateCoupon,
  fetchAdminCoupons,
  fetchPlans,
  type AdminCoupon,
} from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function AdminCouponsPage() {
  const router = useRouter()
  const [coupons, setCoupons] = useState<AdminCoupon[]>([])
  const [plans, setPlans] = useState<Array<{ _id: string; name: string }>>([])
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [planId, setPlanId] = useState('')
  const [maxUses, setMaxUses] = useState('1')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function loadData() {
    setError('')
    try {
      const [couponData, planData] = await Promise.all([
        fetchAdminCoupons(),
        fetchPlans(),
      ])
      setCoupons(couponData)
      setPlans(planData)
      if (!planId && planData[0]?._id) {
        setPlanId(planData[0]._id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load coupons.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      await createCoupon({
        code,
        description,
        planId,
        maxUses: Number(maxUses) || 1,
      })
      setSuccess('Coupon created successfully.')
      setCode('')
      setDescription('')
      setMaxUses('1')
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create coupon.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeactivate(couponId: string) {
    setError('')
    try {
      await deactivateCoupon(couponId)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to deactivate coupon.')
    }
  }

  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/admin/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="font-heading text-3xl font-bold">Manage Coupons</h1>
            <p className="mt-2 text-muted-foreground">
              Create coupon codes that upgrade users to paid plans for free
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Create Coupon</CardTitle>
              <CardDescription>
                Users redeem codes on their account page to unlock paid access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Coupon Code</Label>
                  <Input
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="STUDENT2026"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Student access for 2026 intake"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plan">Plan</Label>
                  <select
                    id="plan"
                    value={planId}
                    onChange={(e) => setPlanId(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    required
                  >
                    {plans.map((plan) => (
                      <option key={plan._id} value={plan._id}>
                        {plan.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxUses">Max Uses</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    min="1"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    required
                  />
                </div>
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                {success ? <p className="text-sm text-success">{success}</p> : null}
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Coupon'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Coupons</CardTitle>
              <CardDescription>{coupons.length} coupon(s)</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="size-8 animate-spin text-primary" />
                </div>
              ) : coupons.length === 0 ? (
                <p className="text-sm text-muted-foreground">No coupons yet.</p>
              ) : (
                <div className="space-y-4">
                  {coupons.map((coupon) => (
                    <div
                      key={coupon._id}
                      className="rounded-lg border border-border p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <Ticket className="size-4 text-primary" />
                            <span className="font-mono font-semibold">{coupon.code}</span>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {coupon.description || 'No description'}
                          </p>
                          <p className="mt-2 text-sm">
                            Plan: <strong>{coupon.plan?.name}</strong> · Uses{' '}
                            {coupon.usedCount}/{coupon.maxUses}
                          </p>
                        </div>
                        <Badge variant={coupon.isActive ? 'gold' : 'secondary'}>
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      {coupon.isActive ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="mt-3"
                          onClick={() => handleDeactivate(coupon._id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Deactivate
                        </Button>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
