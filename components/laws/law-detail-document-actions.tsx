'use client'

import Link from 'next/link'
import { Download, ExternalLink, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  downloadDocumentFile,
  fetchDocument,
  openDocumentFile,
} from '@/lib/api-client'

export function LawDetailDocumentActions({
  lawId,
  lawTitle,
  documentId,
  locked,
  compact = false,
}: {
  lawId: string
  lawTitle: string
  documentId?: string | null
  locked?: boolean
  compact?: boolean
}) {
  if (!documentId) return null

  const canOpen = !locked

  async function handleOpen() {
    if (!documentId || !canOpen) return
    try {
      await openDocumentFile(documentId)
    } catch (err) {
      console.error('Failed to open document:', err)
      alert(
        'Could not open the document. Please try downloading it instead, or refresh the page.',
      )
    }
  }

  async function handleDownload() {
    if (!documentId || !canOpen) return
    try {
      let docTitle = lawTitle
      let fileType: string | undefined
      try {
        const doc = await fetchDocument(documentId)
        if (doc?.title) docTitle = doc.title
        fileType = doc?.fileType
      } catch (err) {
        console.warn('Document metadata fetch failed, using law title fallback')
      }
      await downloadDocumentFile(documentId, docTitle, fileType)
    } catch (err) {
      console.error('Failed to download document:', err)
      alert('Could not download the document. Please try again in a few seconds.')
    }
  }

  return (
    <div className={`flex flex-wrap gap-3 ${compact ? '' : 'mt-8'}`}>
      {canOpen ? (
        <>
          <Button size={compact ? 'sm' : 'default'} className="gap-1.5" onClick={handleOpen}>
            <ExternalLink className="size-4" />
            Open Full Document
          </Button>
          <Button
            size={compact ? 'sm' : 'default'}
            variant="outline"
            className="gap-1.5"
            onClick={handleDownload}
          >
            <Download className="size-4" />
            Download PDF / Word
          </Button>
        </>
      ) : (
        <>
          <Button
            size={compact ? 'sm' : 'default'}
            disabled
            className="gap-1.5"
          >
            <Lock className="size-4" />
            Premium Document — Subscribe to Open
          </Button>
          <Button
            size={compact ? 'sm' : 'default'}
            variant="outline"
            render={<Link href="/pricing" />}
          >
            View Plans
          </Button>
        </>
      )}
    </div>
  )
}
