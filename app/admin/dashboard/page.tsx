'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Upload, Users, LogOut, Loader2, Ticket, Megaphone } from 'lucide-react'
import { clearSession, fetchAdminStats } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState({ documents: 0, users: 0, plans: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await fetchAdminStats()
        setStats(data)
      } catch {
        setStats({ documents: 0, users: 0, plans: 0 })
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const handleLogout = () => {
    clearSession()
    router.push('/admin/login')
  }

  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold">Admin Dashboard</h1>
            <p className="mt-2 text-muted-foreground">
              Upload and manage legal documents for LexLiberia
            </p>
          </div>
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="mb-12 grid gap-4 md:grid-cols-3">
          {[
            { label: 'Documents', value: stats.documents },
            { label: 'Users', value: stats.users },
            { label: 'Plans', value: stats.plans },
          ].map((item) => (
            <Card key={item.label}>
              <CardContent className="pt-6">
                {loading ? (
                  <Loader2 className="size-6 animate-spin text-primary" />
                ) : (
                  <>
                    <p className="font-heading text-3xl font-bold">{item.value}</p>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          <Card
            className="cursor-pointer transition-colors hover:border-primary/50"
            onClick={() => router.push('/admin/upload')}
          >
            <CardHeader className="text-center">
              <Upload className="mx-auto h-12 w-12 text-primary" />
              <CardTitle>Upload Documents</CardTitle>
              <CardDescription>
                Upload PDF and Word legal documents
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button>Upload Now</Button>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer transition-colors hover:border-primary/50"
            onClick={() => router.push('/admin/documents')}
          >
            <CardHeader className="text-center">
              <FileText className="mx-auto h-12 w-12 text-primary" />
              <CardTitle>Manage Documents</CardTitle>
              <CardDescription>
                View, open, and delete uploaded documents
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline">View Documents</Button>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer transition-colors hover:border-primary/50"
            onClick={() => router.push('/admin/users')}
          >
            <CardHeader className="text-center">
              <Users className="mx-auto h-12 w-12 text-primary" />
              <CardTitle>Manage Users</CardTitle>
              <CardDescription>
                View registered users, payments, and account actions
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline">View Users</Button>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer transition-colors hover:border-primary/50"
            onClick={() => router.push('/admin/coupons')}
          >
            <CardHeader className="text-center">
              <Ticket className="mx-auto h-12 w-12 text-primary" />
              <CardTitle>Manage Coupons</CardTitle>
              <CardDescription>
                Create codes for free paid-plan access
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline">Manage Coupons</Button>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer transition-colors hover:border-primary/50"
            onClick={() => router.push('/admin/notices')}
          >
            <CardHeader className="text-center">
              <Megaphone className="mx-auto h-12 w-12 text-primary" />
              <CardTitle>Post Notices</CardTitle>
              <CardDescription>
                Publish homepage announcements or email all users
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline">Manage Notices</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
