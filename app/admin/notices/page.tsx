'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Megaphone } from 'lucide-react'
import {
  createAdminNotice,
  fetchAdminNotices,
  type AdminNotice,
} from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

export default function AdminNoticesPage() {
  const router = useRouter()
  const [notices, setNotices] = useState<AdminNotice[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [type, setType] = useState<'public' | 'email' | 'both'>('public')

  async function loadNotices() {
    setError('')
    try {
      const data = await fetchAdminNotices()
      setNotices(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load notices.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotices()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const result = await createAdminNotice({ title, content, type })
      setSuccess('Notice published successfully.')
      setTitle('')
      setContent('')
      setType('public')

      if (result.data) {
        setNotices((current) => [result.data as AdminNotice, ...current])
      } else {
        await loadNotices()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to publish notice.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/admin/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="font-heading text-3xl font-bold">Public Notices</h1>
            <p className="mt-2 text-muted-foreground">
              Post announcements on the homepage or email all users
            </p>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Megaphone className="size-5 text-primary" />
              <CardTitle>Create Notice</CardTitle>
            </div>
            <CardDescription>
              Public notices appear on the homepage. Email notices go to all active users.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Delivery</Label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) =>
                    setType(e.target.value as 'public' | 'email' | 'both')
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="public">Homepage only</option>
                  <option value="email">Email all users</option>
                  <option value="both">Homepage + email all users</option>
                </select>
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              {success ? <p className="text-sm text-success">{success}</p> : null}
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Publishing...' : 'Publish Notice'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex min-h-[20vh] items-center justify-center">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Recent Notices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {notices.length === 0 ? (
                <p className="text-sm text-muted-foreground">No notices yet.</p>
              ) : (
                notices.map((notice) => (
                  <div
                    key={notice._id}
                    className="border-b border-border pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{notice.title}</p>
                      <Badge variant="secondary">{notice.type}</Badge>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                      {notice.content}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {new Date(notice.createdAt).toLocaleString()}
                    </p>
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
