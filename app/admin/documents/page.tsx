'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, FileText, Loader2, Trash2 } from 'lucide-react'
import {
  deleteDocument,
  fetchDocuments,
  type UploadedDocument,
} from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatCategory(value: string) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export default function AdminDocumentsPage() {
  const router = useRouter()
  const [documents, setDocuments] = useState<UploadedDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function loadDocuments() {
    setError('')
    try {
      const data = await fetchDocuments(100)
      setDocuments(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load documents.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDocuments()
  }, [])

  async function handleDelete(documentId: string) {
    if (!window.confirm('Delete this document permanently?')) return

    setDeletingId(documentId)
    setError('')

    try {
      await deleteDocument(documentId)
      setDocuments((current) => current.filter((doc) => doc._id !== documentId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete document.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/admin/dashboard')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="font-heading text-3xl font-bold">Manage Documents</h1>
              <p className="mt-2 text-muted-foreground">
                View and remove uploaded PDF and Word files
              </p>
            </div>
          </div>
          <Button onClick={() => router.push('/admin/upload')}>Upload New</Button>
        </div>

        {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}

        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : documents.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <FileText className="mx-auto mb-4 size-12 text-muted-foreground" />
              <p className="text-muted-foreground">No documents uploaded yet.</p>
              <Button className="mt-4" onClick={() => router.push('/admin/upload')}>
                Upload First Document
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {documents.map((doc) => (
              <Card key={doc._id}>
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg">{doc.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {doc.description}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{formatCategory(doc.category)}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span>{formatFileSize(doc.fileSize)}</span>
                    <span>{doc.views} views</span>
                    <span>
                      Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deletingId === doc._id}
                    onClick={() => handleDelete(doc._id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deletingId === doc._id ? 'Deleting...' : 'Delete'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
