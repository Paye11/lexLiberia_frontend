'use client'

import { useRouter } from 'next/navigation'
import { FileText, Upload, Users, LogOut } from 'lucide-react'
import { clearSession } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SectionHeading } from '@/components/section-heading'

export default function AdminDashboardPage() {
  const router = useRouter()

  const handleLogout = () => {
    clearSession()
    router.push('/admin/login')
  }

  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="font-heading text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">Manage documents and settings for LexLiberia</p>
          </div>
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card 
            className="hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => router.push('/admin/upload')}
          >
            <CardHeader className="text-center">
              <Upload className="mx-auto h-12 w-12 text-primary" />
              <CardTitle>Upload Documents</CardTitle>
              <CardDescription>Upload new laws and legal documents</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button>Upload Now</Button>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader className="text-center">
              <FileText className="mx-auto h-12 w-12 text-primary" />
              <CardTitle>Manage Documents</CardTitle>
              <CardDescription>View and organize all uploaded documents</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline">View Documents</Button>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/50 transition-colors">
            <CardHeader className="text-center">
              <Users className="mx-auto h-12 w-12 text-primary" />
              <CardTitle>Manage Users</CardTitle>
              <CardDescription>View and manage platform users</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button variant="outline">View Users</Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12">
          <SectionHeading 
            eyebrow="Quick Stats" 
            title="Platform Overview"
            description="Current status of your LexLiberia platform"
          />
        </div>
      </div>
    </section>
  )
}
