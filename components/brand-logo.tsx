import Link from 'next/link'
import { Scale } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BrandLogo({
  className,
  href = '/',
}: {
  className?: string
  href?: string
}) {
  return (
    <Link
      href={href}
      className={cn('flex items-center gap-2.5', className)}
      aria-label="LexLiberia home"
    >
      <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <Scale className="size-5" />
      </span>
      <span className="font-heading text-lg font-bold leading-none tracking-tight">
        Lex<span className="text-secondary">Liberia</span>
      </span>
    </Link>
  )
}
