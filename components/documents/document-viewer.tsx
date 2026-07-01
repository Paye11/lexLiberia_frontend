'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { fetchDocumentFileBlob, isPdfDocument } from '@/lib/api-client'
import { Button } from '@/components/ui/button'

interface DocumentViewerProps {
  documentId: string
  fileType: string
  title: string
  onDownload: () => void
  downloading?: boolean
}

export function DocumentViewer({
  documentId,
  fileType,
  title,
  onDownload,
  downloading = false,
}: DocumentViewerProps) {
  const [viewerUrl, setViewerUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let objectUrl: string | null = null
    let cancelled = false

    async function loadViewer() {
      setLoading(true)
      setError('')

      try {
        const blob = await fetchDocumentFileBlob(documentId)
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setViewerUrl(objectUrl)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load document.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadViewer()

    return () => {
      cancelled = true
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [documentId])

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-lg border border-border bg-muted/20">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-5">
        <p className="font-medium text-destructive">{error}</p>
        <Button className="mt-4" variant="outline" onClick={onDownload} disabled={downloading}>
          {downloading ? 'Downloading...' : 'Try Download Instead'}
        </Button>
      </div>
    )
  }

  if (isPdfDocument(fileType) && viewerUrl) {
    return (
      <div className="overflow-hidden rounded-lg border border-border bg-muted/20">
        <iframe
          title={title}
          src={viewerUrl}
          className="h-[75vh] w-full bg-white"
        />
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-6 text-center">
      <p className="font-medium">In-browser preview is not available for this file type.</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Download the document to open it in Word or another compatible app.
      </p>
      <Button className="mt-4" onClick={onDownload} disabled={downloading}>
        {downloading ? 'Downloading...' : 'Download Document'}
      </Button>
    </div>
  )
}
