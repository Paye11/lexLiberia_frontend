'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ResearchChat } from '@/components/ai/research-chat'
import { getStoredUser, type SessionUser } from '@/lib/api-client'

export default function AiResearchPage() {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setUser(getStoredUser())
    setReady(true)
  }, [])

  if (!ready) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="animate-pulse text-sm text-muted-foreground">Loading…</div>
      </div>
    )
  }

  if (user?.role !== 'admin') {
    return (
      <section className="flex h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="max-w-lg text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Lock className="size-7" />
          </div>
          <h1 className="mt-6 font-heading text-2xl font-bold">
            AI Research is restricted to admin accounts
          </h1>
          <p className="mt-3 text-muted-foreground">
            Only LexLiberia administrators can use this AI tool. If you are the admin,
            sign in with your admin account to continue.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button render={<Link href="/login" />}>Login as Admin</Button>
            <Button variant="outline" render={<Link href="/" />}>Back to Home</Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <ResearchChat
      otherAssistant={{ href: '/ask-me', label: 'Or open Ask Me' }}
    />
  )
}
