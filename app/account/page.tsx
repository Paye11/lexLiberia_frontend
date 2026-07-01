'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Crown, Loader2 } from 'lucide-react'
import { getMe, getStoredUser, type SessionUser } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function AccountPage() {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadAccount() {
      try {
        const stored = getStoredUser()
        if (!stored) {
          setError('Please log in to view your account.')
          return
        }

        const freshUser = await getMe()
        setUser(freshUser)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load account.')
      } finally {
        setLoading(false)
      }
    }

    loadAccount()
  }, [])

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

              <Button className="mt-6" render={<Link href="/pricing" />}>
                View All Plans
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
