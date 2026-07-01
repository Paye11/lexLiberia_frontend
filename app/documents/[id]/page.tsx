'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Download, Loader2, Lock } from 'lucide-react'
import {
  downloadDocumentFile,
  fetchDocument,
  getStoredUser,
  type UploadedDocument,
} from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function DocumentDetailPage() {
  const params = useParams<{ id: string }>()
  const [document, setDocument] = useState<UploadedDocument | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)
  const user = getStoredUser()

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchDocument(params.id)
        setDocument(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load document.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [params.id])

  async function handleDownload() {
    if (!document) return
    setDownloading(true)
    setError('')
    try {
      await downloadDocumentFile(document._id, `${document.title}.pdf`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed.')
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!document) {
    return (
      <section className="py-20 text-center">
        <p className="text-destructive">{error || 'Document not found.'}</p>
        <Button className="mt-4" render={<Link href="/laws" />}>
          Back to Laws
        </Button>
      </section>
    )
  }

  const locked = document.locked || !document.filePath

  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" className="mb-6" render={<Link href="/laws" />}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Laws
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">{document.title}</CardTitle>
                <CardDescription className="mt-2">{document.description}</CardDescription>
              </div>
              {locked ? (
                <Badge variant="secondary">
                  <Lock className="mr-1 size-3" />
                  Locked
                </Badge>
              ) : (
                <Badge variant="gold">Premium Access</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Category: {document.category} · {document.views} views
            </div>

            {locked ? (
              <div className="rounded-lg border border-border bg-muted/40 p-5">
                <p className="font-medium">This document requires a paid plan</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Upgrade your account or redeem an admin coupon to view and download premium uploads.
                </p>
                <div className="mt-4 flex gap-3">
                  <Button render={<Link href="/pricing" />}>View Plans</Button>
                  <Button variant="outline" render={<Link href="/account" />}>
                    Redeem Coupon
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleDownload} disabled={downloading}>
                  <Download className="mr-2 h-4 w-4" />
                  {downloading ? 'Downloading...' : 'Download Document'}
                </Button>
                {user?.access?.isAdmin ? (
                  <Badge variant="secondary">Admin — free unlimited access</Badge>
                ) : null}
              </div>
            )}

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
