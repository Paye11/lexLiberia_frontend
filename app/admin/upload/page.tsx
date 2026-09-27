'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileText, X, ArrowLeft } from 'lucide-react'
import { uploadDocuments } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const CATEGORIES = [
  { value: 'constitution', label: 'Constitution' },
  { value: 'civil-procedure', label: 'Civil Procedure Law' },
  { value: 'criminal-procedure', label: 'Criminal Procedure Law' },
  { value: 'penal', label: 'Penal Law' },
  { value: 'judiciary', label: 'Judiciary Law' },
  { value: 'property', label: 'Property Law' },
  { value: 'labor', label: 'Labor Law' },
  { value: 'revenue', label: 'Revenue Code' },
  { value: 'commercial', label: 'Commercial Law' },
  { value: 'election', label: 'Election Law' },
  { value: 'environmental', label: 'Environmental Law' },
  { value: 'supreme-court-opinions', label: 'Supreme Court Opinions' },
  { value: 'regulations', label: 'Regulations' },
  { value: 'executive-orders', label: 'Executive Orders' },
]

type PendingUpload = {
  id: string
  file: File
  title: string
  category: string
}

function titleFromFile(file: File) {
  return file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim()
}

export default function AdminUploadPage() {
  const router = useRouter()
  const [pending, setPending] = useState<PendingUpload[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function addFiles(list: FileList | null) {
    if (!list?.length) return
    const next: PendingUpload[] = []
    Array.from(list).forEach((file) => {
      const extension = file.name.split('.').pop()?.toLowerCase()
      if (!extension || !['pdf', 'doc', 'docx'].includes(extension)) return
      const alreadyAdded = pending.some((item) => item.file.name === file.name && item.file.size === file.size)
        || next.some((item) => item.file.name === file.name && item.file.size === file.size)
      if (alreadyAdded) return
      next.push({
        id: `${file.name}-${file.size}-${file.lastModified}`,
        file,
        title: titleFromFile(file),
        category: '',
      })
    })
    if (next.length) {
      setPending((current) => [...current, ...next].slice(0, 15))
      setSuccess('')
      setError('')
    }
  }

  function updateItem(id: string, patch: Partial<PendingUpload>) {
    setPending((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  const missingCategory = pending.some((item) => !item.category || !item.title.trim())

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!pending.length || missingCategory) return

    setError('')
    setSuccess('')
    setIsUploading(true)

    try {
      const result = await uploadDocuments(pending.map((item) => ({
        title: item.title.trim(),
        description: item.title.trim(),
        category: item.category,
        file: item.file,
      })))
      const count = Number(result?.count || pending.length)
      setSuccess(count === 1 ? '1 file uploaded.' : `${count} files uploaded.`)
      setPending([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to upload the files.')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <section className="py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center">
          <Button variant="ghost" onClick={() => router.push('/admin/dashboard')} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="font-heading text-3xl font-bold">Upload Documents</h1>
            <p className="mt-2 text-muted-foreground">Add several PDF or Word files, then choose a category for each one.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>New documents</CardTitle>
            <CardDescription>The files stay out of the library until every one has a category.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div
                className="cursor-pointer rounded-lg border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary/50"
                onClick={() => document.getElementById('file-upload')?.click()}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault()
                  addFiles(event.dataTransfer.files)
                }}
              >
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    addFiles(event.target.files)
                    event.target.value = ''
                  }}
                />
                <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="mb-2 text-lg font-medium">Drop files here or click to browse</p>
                <p className="text-sm text-muted-foreground">You can add up to 15 PDF or Word files at once.</p>
              </div>

              {pending.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm font-medium">Choose a category for each file</p>
                  {pending.map((item) => (
                    <div key={item.id} className="space-y-3 rounded-lg border border-border p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <FileText className="h-5 w-5 shrink-0 text-primary" />
                          <span className="truncate text-sm">{item.file.name}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setPending((current) => current.filter((entry) => entry.id !== item.id))}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`title-${item.id}`}>Title</Label>
                          <Input
                            id={`title-${item.id}`}
                            value={item.title}
                            onChange={(event) => updateItem(item.id, { title: event.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`category-${item.id}`}>Category</Label>
                          <select
                            id={`category-${item.id}`}
                            value={item.category}
                            onChange={(event) => updateItem(item.id, { category: event.target.value })}
                            className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                            required
                          >
                            <option value="">Select a category</option>
                            {CATEGORIES.map((category) => (
                              <option key={category.value} value={category.value}>
                                {category.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              {success ? <p className="text-sm text-success">{success}</p> : null}

              <div className="flex gap-4">
                <Button type="submit" disabled={isUploading || pending.length === 0 || missingCategory}>
                  {isUploading ? 'Uploading...' : 'Upload files'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPending([])
                    setError('')
                    setSuccess('')
                  }}
                >
                  Clear
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
