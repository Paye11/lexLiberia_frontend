'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Loader2,
  FolderTree,
  Trash2,
  Edit2,
  Check,
  X,
  AlertTriangle,
  Plus,
} from 'lucide-react'
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  fetchCategoryStats,
  updateCategory,
  type AdminCategory,
  type AdminCategoryStat,
} from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function AdminCategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<AdminCategory[]>([])
  const [stats, setStats] = useState<AdminCategoryStat[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [order, setOrder] = useState('0')
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editOrder, setEditOrder] = useState('0')
  const [editIsActive, setEditIsActive] = useState(true)
  const [savingEdit, setSavingEdit] = useState(false)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AdminCategory | null>(null)
  const [deleteReassign, setDeleteReassign] = useState<string>('')
  const [deleting, setDeleting] = useState(false)

  async function loadData() {
    setError('')
    try {
      const [catData, statData] = await Promise.all([
        fetchCategories(true),
        fetchCategoryStats().catch(() => [] as AdminCategoryStat[]),
      ])
      setCategories(catData)
      setStats(statData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load categories.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const countBySlug = useMemo(() => {
    const map = new Map<string, number>()
    stats.forEach((row) => map.set(row.slug, row.count))
    return map
  }, [stats])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      await createCategory({
        name: name.trim(),
        description: description.trim(),
        order: Number(order) || 0,
        isActive,
      })
      setSuccess('Category created successfully.')
      setName('')
      setDescription('')
      setOrder('0')
      setIsActive(true)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create category.')
    } finally {
      setSubmitting(false)
    }
  }

  function startEdit(row: AdminCategory) {
    setEditingId(row._id)
    setEditName(row.name)
    setEditDescription(row.description || '')
    setEditOrder(String(typeof row.order === 'number' ? row.order : 0))
    setEditIsActive(row.isActive !== false)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditName('')
    setEditDescription('')
    setEditOrder('0')
    setEditIsActive(true)
  }

  async function saveEdit(row: AdminCategory) {
    if (!editName.trim()) return
    setSavingEdit(true)
    setError('')
    try {
      await updateCategory(row._id, {
        name: editName.trim(),
        description: editDescription.trim(),
        order: Number(editOrder) || 0,
        isActive: editIsActive,
      })
      cancelEdit()
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update category.')
    } finally {
      setSavingEdit(false)
    }
  }

  function askDelete(row: AdminCategory) {
    setDeleteTarget(row)
    setDeleteReassign('')
    setDeleteOpen(true)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    setError('')
    try {
      await deleteCategory(deleteTarget._id, deleteReassign || undefined)
      setDeleteOpen(false)
      setDeleteTarget(null)
      setDeleteReassign('')
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete category.')
    } finally {
      setDeleting(false)
    }
  }

  const deleteCount = deleteTarget ? (countBySlug.get(deleteTarget.slug) || 0) : 0

  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/admin/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="font-heading text-3xl font-bold">Manage Categories</h1>
            <p className="mt-2 text-muted-foreground">
              Create, rename, reorder, or retire the categories that organize your uploaded laws and documents.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="size-5 text-primary" />
                New Category
              </CardTitle>
              <CardDescription>
                When you upload files, the category you create here will appear in the picker.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Magisterial Court Rules"
                    minLength={2}
                    maxLength={80}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Short Description (optional)</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Small claims, traffic, and township offences"
                    maxLength={240}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="order">Sort Order</Label>
                    <Input
                      id="order"
                      type="number"
                      step="1"
                      value={order}
                      onChange={(e) => setOrder(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Lower numbers appear first.</p>
                  </div>
                  <div className="flex items-end gap-3 rounded-lg border border-border p-3">
                    <Switch
                      id="new-active"
                      checked={isActive}
                      onCheckedChange={setIsActive}
                    />
                    <div className="min-w-0">
                      <Label htmlFor="new-active">Visible to readers</Label>
                      <p className="text-xs text-muted-foreground">
                        Inactive categories still keep their files.
                      </p>
                    </div>
                  </div>
                </div>
                {error ? <p className="text-sm text-destructive">{error}</p> : null}
                {success ? <p className="text-sm text-success">{success}</p> : null}
                <Button type="submit" disabled={submitting || !name.trim()}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Category
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderTree className="size-5 text-primary" />
                All Categories
              </CardTitle>
              <CardDescription>
                {loading
                  ? 'Loading categories...'
                  : `${categories.length} category(s) · ${stats.reduce((sum, s) => sum + (s.count || 0), 0)} total documents sorted`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="size-8 animate-spin text-primary" />
                </div>
              ) : categories.length === 0 ? (
                <p className="text-sm text-muted-foreground">No categories yet — create your first one on the left.</p>
              ) : (
                <div className="space-y-3">
                  {categories.map((row) => {
                    const rowCount = countBySlug.get(row.slug) || 0
                    const isEditing = editingId === row._id
                    return (
                      <div key={row._id} className="rounded-lg border border-border p-4">
                        {isEditing ? (
                          <div className="space-y-3">
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div className="space-y-1 sm:col-span-2">
                                <Label>Name</Label>
                                <Input value={editName} onChange={(e) => setEditName(e.target.value)} maxLength={80} />
                              </div>
                              <div className="space-y-1 sm:col-span-2">
                                <Label>Description</Label>
                                <Input
                                  value={editDescription}
                                  onChange={(e) => setEditDescription(e.target.value)}
                                  maxLength={240}
                                />
                              </div>
                              <div className="space-y-1">
                                <Label>Sort order</Label>
                                <Input
                                  type="number"
                                  value={editOrder}
                                  onChange={(e) => setEditOrder(e.target.value)}
                                />
                              </div>
                              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                                <Switch
                                  id={`edit-active-${row._id}`}
                                  checked={editIsActive}
                                  onCheckedChange={setEditIsActive}
                                />
                                <div className="min-w-0">
                                  <Label htmlFor={`edit-active-${row._id}`}>Visible to readers</Label>
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={cancelEdit}
                                disabled={savingEdit}
                              >
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => saveEdit(row)}
                                disabled={savingEdit || !editName.trim()}
                              >
                                <Check className="mr-2 h-4 w-4" />
                                {savingEdit ? 'Saving...' : 'Save'}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <FolderTree className="size-4 shrink-0 text-primary" />
                                  <span className="font-semibold">{row.name}</span>
                                  <Badge variant={row.isActive ? 'default' : 'secondary'}>
                                    {row.isActive ? 'Active' : 'Hidden'}
                                  </Badge>
                                  <Badge variant="gold">{rowCount} file{rowCount === 1 ? '' : 's'}</Badge>
                                  {typeof row.order === 'number' && row.order !== 0 ? (
                                    <Badge variant="outline">Order {row.order}</Badge>
                                  ) : null}
                                </div>
                                {(row.description || '').trim() ? (
                                  <p className="mt-2 text-sm text-muted-foreground">
                                    {row.description}
                                  </p>
                                ) : null}
                                <p className="mt-1 text-xs text-muted-foreground/80">
                                  slug · <span className="font-mono">{row.slug}</span>
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => startEdit(row)}
                                  disabled={Boolean(editingId)}
                                >
                                  <Edit2 className="mr-2 h-4 w-4" />
                                  Edit
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => askDelete(row)}
                                  disabled={Boolean(editingId)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={deleteOpen} onOpenChange={(next) => !deleting && setDeleteOpen(next)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-destructive" />
              Delete {deleteTarget ? `“${deleteTarget.name}”` : 'category'}?
            </DialogTitle>
            <DialogDescription>
              {deleteCount > 0 ? (
                <>
                  This category contains{' '}
                  <strong>{deleteCount} document{deleteCount === 1 ? '' : 's'}</strong>.
                  Choose where to move them before you delete.
                </>
              ) : (
                <>This category has no documents, so it can be removed immediately.</>
              )}
            </DialogDescription>
          </DialogHeader>
          {deleteCount > 0 && deleteTarget ? (
            <div className="space-y-2">
              <Label htmlFor="reassign">Reassign documents to</Label>
              <select
                id="reassign"
                value={deleteReassign}
                onChange={(e) => setDeleteReassign(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">Select a category...</option>
                {categories
                  .filter((row) => row._id !== deleteTarget._id && row.isActive !== false)
                  .map((row) => (
                    <option key={row._id} value={row._id}>
                      {row.name}
                    </option>
                  ))}
              </select>
            </div>
          ) : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteOpen(false)
                setDeleteTarget(null)
                setDeleteReassign('')
              }}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting || (deleteCount > 0 && !deleteReassign)}
            >
              {deleting ? 'Deleting...' : 'Delete category'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
