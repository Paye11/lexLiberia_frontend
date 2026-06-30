'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileText, X, ArrowLeft } from 'lucide-react'
import { uploadDocument } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminUploadPage() {
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const removeFile = () => {
    setSelectedFile(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return

    setError('')
    setSuccess('')
    setIsUploading(true)

    try {
      await uploadDocument({
        title,
        description,
        category,
        file: selectedFile,
      })

      setSuccess('Document uploaded successfully.')
      setSelectedFile(null)
      setTitle('')
      setDescription('')
      setCategory('')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to upload document.',
      )
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <section className="py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8">
          <Button variant="ghost" onClick={() => router.push('/admin/dashboard')} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="font-heading text-3xl font-bold">Upload Documents</h1>
            <p className="text-muted-foreground mt-2">Upload legal documents (PDF and Word supported)</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>New Document</CardTitle>
            <CardDescription>Fill out the form and upload your legal documents</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Document Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter document title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="constitution">Constitution</option>
                    <option value="civil-procedure">Civil Procedure Law</option>
                    <option value="criminal-procedure">Criminal Procedure Law</option>
                    <option value="penal">Penal Law</option>
                    <option value="judiciary">Judiciary Law</option>
                    <option value="property">Property Law</option>
                    <option value="labor">Labor Law</option>
                    <option value="revenue">Revenue Code</option>
                    <option value="commercial">Commercial Law</option>
                    <option value="election">Election Law</option>
                    <option value="environmental">Environmental Law</option>
                    <option value="supreme-court-opinions">Supreme Court Opinions</option>
                    <option value="regulations">Regulations</option>
                    <option value="executive-orders">Executive Orders</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter document description"
                    rows={4}
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Upload Documents (PDF / Word)</Label>
                <div
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        setSelectedFile(e.target.files[0] ?? null)
                      }
                    }}
                  />
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">Drop files here or click to browse</p>
                  <p className="text-sm text-muted-foreground">Supports PDF (.pdf) and Word (.doc, .docx)</p>
                </div>

                {selectedFile ? (
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Selected File</p>
                    <div className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <span className="text-sm">{selectedFile.name}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={removeFile}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>

              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              {success ? <p className="text-sm text-success">{success}</p> : null}

              <div className="flex gap-4">
                <Button type="submit" disabled={isUploading || !selectedFile}>
                  {isUploading ? 'Uploading...' : 'Upload Documents'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedFile(null)
                    setTitle('')
                    setDescription('')
                    setCategory('')
                    setError('')
                    setSuccess('')
                  }}
                >
                  Clear Form
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
