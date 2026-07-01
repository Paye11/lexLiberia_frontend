'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { fetchAdminUsers } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type AdminUser = {
  _id: string
  name: string
  email: string
  role: string
  plan?: { name: string } | null
  createdAt: string
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await fetchAdminUsers()
        setUsers(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load users.')
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [])

  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/admin/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="font-heading text-3xl font-bold">Manage Users</h1>
            <p className="mt-2 text-muted-foreground">
              Registered platform users and their plans
            </p>
          </div>
        </div>

        {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}

        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{users.length} Users</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {users.length === 0 ? (
                <p className="text-sm text-muted-foreground">No users registered yet.</p>
              ) : (
                users.map((user) => (
                  <div
                    key={user._id}
                    className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">
                        {user.plan?.name || 'No plan'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  )
}
