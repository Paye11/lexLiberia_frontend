'use client'

import { useState } from 'react'
import { DocumentViewer } from '@/components/documents/document-viewer'
import { downloadDocumentFile } from '@/lib/api-client'

export function LawDocumentViewer({
  documentId,
  fileType,
  title,
}: {
  documentId: string
  fileType: string
  title: string
}) {
  const [downloading, setDownloading] = useState(false)

  async function handleDownload() {
    setDownloading(true)
    try {
      await downloadDocumentFile(documentId, title, fileType)
    } catch (err) {
      console.error('Failed to download from viewer fallback:', err)
      alert('Could not download the document. Please try again in a few seconds.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <DocumentViewer
      documentId={documentId}
      fileType={fileType}
      title={title}
      onDownload={handleDownload}
      downloading={downloading}
    />
  )
}
