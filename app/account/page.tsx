'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Crown, Loader2, Ticket } from 'lucide-react'
import { getAccessProfile, getMe, getStoredUser, redeemCoupon, type SessionUser } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function AccountPage() {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [couponMessage, setCouponMessage] = useState('')
  const [couponError, setCouponError] = useState('')
  const [redeeming, setRedeeming] = useState(false)

  useEffect(() => {
    async function loadAccount() {
      try {
        const stored = getStoredUser()
        if (!stored) {
          setError('Please log in to view your account.')
          return
        }

        const profile = await getAccessProfile()
        setUser(profile.user)
      } catch {
        const freshUser = await getMe()
        setUser(freshUser)
      } finally {
        setLoading(false)
      }
    }

    loadAccount()
  }, [])

  async function handleRedeem(e: React.FormEvent) {
    e.preventDefault()
    setRedeeming(true)
    setCouponError('')
    setCouponMessage('')

    try {
      const result = await redeemCoupon(couponCode)
      setUser(result.user)
      setCouponMessage(result.message || 'Coupon applied successfully.')
      setCouponCode('')
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : 'Unable to redeem coupon.')
    } finally {
      setRedeeming(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !user) {
    return (
      <section className="py-20">
        <div className="mx-auto max-w-lg px-4 text-center">
          <p className="text-destructive">{error || 'Account not found.'}</p>
          <Button className="mt-4" render={<Link href="/login" />}>
            Go to Login
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold">My Account</h1>
          <p className="mt-2 text-muted-foreground">
            Welcome back, {user.name}
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-border pb-3">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{user.name}</span>
              </div>
              <div className="flex justify-between gap-4 border-b border-border pb-3">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{user.email}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Role</span>
                <Badge variant="secondary" className="capitalize">
                  {user.role}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Crown className="size-5 text-primary" />
                <CardTitle>Current Plan</CardTitle>
              </div>
              <CardDescription>Your active subscription on LexLiberia</CardDescription>
            </CardHeader>
            <CardContent>
              {user.plan ? (
                <div className="space-y-3">
                  <div>
                    <p className="font-heading text-2xl font-bold">{user.plan.name}</p>
                    {user.plan.description ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {user.plan.description}
                      </p>
                    ) : null}
                  </div>
                  {typeof user.plan.dailyViewLimit === 'number' &&
                  user.plan.dailyViewLimit > 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Daily document views: {user.plan.dailyViewLimit}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Unlimited document views
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    No plan assigned yet. New accounts receive the Free plan
                    automatically.
                  </p>
                </div>
              )}

              {user.access?.isAdmin ? (
                <Badge variant="gold" className="mt-3">
                  Admin — full free access to documents and AI research
                </Badge>
              ) : user.access?.hasPaidPlan ? (
                <Badge variant="gold" className="mt-3">
                  Premium access active
                </Badge>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  Free plan — premium uploads and AI research require a paid plan or coupon.
                </p>
              )}

              <Button className="mt-6" render={<Link href="/pricing" />}>
                View All Plans
              </Button>
            </CardContent>
          </Card>

          {!user.access?.isAdmin ? (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Ticket className="size-5 text-primary" />
                  <CardTitle>Redeem Coupon</CardTitle>
                </div>
                <CardDescription>
                  Enter an admin coupon code to upgrade your plan without payment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRedeem} className="flex flex-col gap-3 sm:flex-row">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="coupon">Coupon Code</Label>
                    <Input
                      id="coupon"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="ENTER-CODE"
                      required
                    />
                  </div>
                  <Button type="submit" className="sm:self-end" disabled={redeeming}>
                    {redeeming ? 'Applying...' : 'Apply Coupon'}
                  </Button>
                </form>
                {couponMessage ? (
                  <p className="mt-3 text-sm text-success">{couponMessage}</p>
                ) : null}
                {couponError ? (
                  <p className="mt-3 text-sm text-destructive">{couponError}</p>
                ) : null}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </section>
  )
}
