'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, Lock, Loader2 } from 'lucide-react'
import {
  fetchDocuments,
  getStoredUser,
  type UploadedDocument,
} from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

function formatCategory(value: string) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function PremiumDocuments() {
  const [documents, setDocuments] = useState<UploadedDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const user = getStoredUser()
  const canView = user?.access?.canViewPremiumDocuments || user?.role === 'admin'

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchDocuments(20)
        setDocuments(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load premium documents.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return <p className="py-8 text-center text-sm text-destructive">{error}</p>
  }

  if (documents.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No premium documents uploaded yet.
      </p>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {documents.map((doc) => (
        <Card key={doc._id}>
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-lg">{doc.title}</CardTitle>
                <CardDescription className="mt-1">{doc.description}</CardDescription>
              </div>
              {doc.locked ? (
                <Badge variant="secondary">
                  <Lock className="mr-1 size-3" />
                  Paid
                </Badge>
              ) : (
                <Badge variant="gold">Unlocked</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="size-4" />
              {formatCategory(doc.category)}
            </div>
            {doc.locked ? (
              <Button variant="outline" size="sm" render={<Link href="/account" />}>
                Upgrade to View
              </Button>
            ) : (
              <Button size="sm" render={<Link href={`/documents/${doc._id}`} />}>
                View Document
              </Button>
            )}
          </CardContent>
        </Card>
      ))}

      {!canView ? (
        <p className="md:col-span-2 text-center text-sm text-muted-foreground">
          Premium uploads are for paid accounts only. Redeem a coupon on your account page or choose a plan on pricing.
        </p>
      ) : null}
    </div>
  )
}
