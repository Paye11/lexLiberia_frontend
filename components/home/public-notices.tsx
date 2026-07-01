import { Megaphone } from 'lucide-react'
import { fetchPublicNotices } from '@/lib/api-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export async function PublicNotices() {
  const notices = await fetchPublicNotices()

  if (notices.length === 0) {
    return null
  }

  return (
    <section className="border-y border-border bg-muted/30 py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-2">
          <Megaphone className="size-5 text-primary" />
          <h2 className="font-heading text-2xl font-bold">Platform Notices</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {notices.map((notice) => (
            <Card key={notice._id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{notice.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {notice.content}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {new Date(notice.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
