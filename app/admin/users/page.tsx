'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Ban,
  Loader2,
  Mail,
  Trash2,
  UserCheck,
} from 'lucide-react'
import {
  deleteAdminUser,
  disableAdminUser,
  enableAdminUser,
  fetchAdminUsers,
  sendAdminMessage,
} from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type AdminUser = Awaited<ReturnType<typeof fetchAdminUsers>>[number]

function formatDate(value?: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString()
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionId, setActionId] = useState<string | null>(null)
  const [messageUser, setMessageUser] = useState<AdminUser | null>(null)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [messageStatus, setMessageStatus] = useState('')

  async function loadUsers() {
    setError('')
    try {
      const data = await fetchAdminUsers()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load users.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  async function handleDisable(userId: string) {
    setActionId(userId)
    try {
      await disableAdminUser(userId)
      setUsers((current) =>
        current.map((user) =>
          user._id === userId ? { ...user, isActive: false } : user,
        ),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to disable user.')
    } finally {
      setActionId(null)
    }
  }

  async function handleEnable(userId: string) {
    setActionId(userId)
    try {
      await enableAdminUser(userId)
      setUsers((current) =>
        current.map((user) =>
          user._id === userId ? { ...user, isActive: true } : user,
        ),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to enable user.')
    } finally {
      setActionId(null)
    }
  }

  async function handleDelete(userId: string) {
    if (!window.confirm('Delete this user permanently? This cannot be undone.')) {
      return
    }

    setActionId(userId)
    try {
      await deleteAdminUser(userId)
      setUsers((current) => current.filter((user) => user._id !== userId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete user.')
    } finally {
      setActionId(null)
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!messageUser) return

    setMessageStatus('')
    setActionId(messageUser._id)

    try {
      const result = await sendAdminMessage({
        userId: messageUser._id,
        subject,
        body,
      })

      const emailNote =
        result.email?.sent === false
          ? ' Message saved; email was not sent (SMTP may not be configured).'
          : ' Message sent by email and saved in the user account.'

      setMessageStatus(`Message sent to ${messageUser.name}.${emailNote}`)
      setSubject('')
      setBody('')
      setMessageUser(null)
    } catch (err) {
      setMessageStatus(
        err instanceof Error ? err.message : 'Unable to send message.',
      )
    } finally {
      setActionId(null)
    }
  }

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
              View accounts, payment details, expiry dates, and account actions
            </p>
          </div>
        </div>

        {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}
        {messageStatus ? (
          <p className="mb-4 text-sm text-muted-foreground">{messageStatus}</p>
        ) : null}

        {messageUser ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Send Message to {messageUser.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="body">Message</Label>
                  <Textarea
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={5}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setMessageUser(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={actionId === messageUser._id}>
                    {actionId === messageUser._id ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : null}

        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{users.length} Users</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {users.length === 0 ? (
                <p className="text-sm text-muted-foreground">No users registered yet.</p>
              ) : (
                users.map((user) => (
                  <div
                    key={user._id}
                    className="space-y-3 border-b border-border pb-6 last:border-0 last:pb-0"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{user.name}</p>
                          {!user.isActive ? (
                            <Badge variant="destructive">Disabled</Badge>
                          ) : (
                            <Badge variant="secondary">Active</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Joined {formatDate(user.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={actionId === user._id}
                          onClick={() => {
                            setMessageUser(user)
                            setMessageStatus('')
                          }}
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          Message
                        </Button>
                        {user.isActive ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={actionId === user._id}
                            onClick={() => handleDisable(user._id)}
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Disable
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={actionId === user._id}
                            onClick={() => handleEnable(user._id)}
                          >
                            <UserCheck className="mr-2 h-4 w-4" />
                            Enable
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={actionId === user._id}
                          onClick={() => handleDelete(user._id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-3 rounded-lg bg-muted/40 p-4 text-sm md:grid-cols-2">
                      <div>
                        <p className="font-medium">Plan</p>
                        <p className="text-muted-foreground">
                          {user.plan?.name || 'No plan'}
                          {typeof user.plan?.priceMonthly === 'number'
                            ? ` — $${user.plan.priceMonthly}/mo`
                            : ''}
                        </p>
                        <p className="mt-2 font-medium">Plan expires</p>
                        <p className="text-muted-foreground">
                          {formatDate(user.planExpiresAt)}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Latest payment</p>
                        {user.latestPayment ? (
                          <div className="space-y-1 text-muted-foreground">
                            <p>
                              {user.latestPayment.planName || 'Plan'} — $
                              {user.latestPayment.amount} ({user.latestPayment.billingCycle})
                            </p>
                            <p>Method: {user.latestPayment.paymentMethod}</p>
                            <p>Status: {user.latestPayment.status}</p>
                            <p>
                              {formatDate(user.latestPayment.startDate)} →{' '}
                              {formatDate(user.latestPayment.endDate)}
                            </p>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">No payment on record</p>
                        )}
                      </div>
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
