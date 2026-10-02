'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CreditCard, LogIn, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getStoredUser, type SessionUser } from '@/lib/api-client'
import { usePathname } from 'next/navigation'

export function MobileCtaBar() {
  const pathname = usePathname()
  const [user, setUser] = useState<SessionUser | null>(null)

  useEffect(() => {
    setUser(getStoredUser())
  }, [pathname])

  const isLoggedIn = Boolean(user)

  const isHomePage = pathname === '/'

  if (!isHomePage) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-md sm:hidden">
      <div className="mx-auto flex max-w-md items-center gap-2 px-3 py-2.5">
        {!isLoggedIn ? (
          <>
            <Button
              variant="outline"
              size="sm"
              className="h-10 flex-1 px-2"
              render={<Link href="/login" />}
            >
              <LogIn className="size-4" />
              Login
            </Button>
            <Button
              size="sm"
              className="h-10 flex-1 px-2"
              render={<Link href="/register" />}
            >
              <UserPlus className="size-4" />
              Register
            </Button>
            <Button
              variant="gold"
              size="sm"
              className="h-10 flex-1 px-2"
              render={<Link href="/pricing" />}
            >
              <CreditCard className="size-4" />
              Pay
            </Button>
          </>
        ) : (
          <Button
            variant="gold"
            size="sm"
            className="h-10 w-full"
            render={<Link href="/pricing" />}
          >
            <CreditCard className="size-4" />
            Subscribe / Pay Now
          </Button>
        )}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  )
}
