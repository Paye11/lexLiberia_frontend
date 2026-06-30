'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getStoredUser, getStoredToken } from '@/lib/api-client'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const token = getStoredToken()
    const user = getStoredUser()

    if (
      pathname !== '/admin/login' &&
      (!token || !user || user.role !== 'admin')
    ) {
      router.push('/admin/login')
    }

    setReady(true)
  }, [pathname, router])

  if (!ready && pathname !== '/admin/login') {
    return null
  }

  return <>{children}</>
}
