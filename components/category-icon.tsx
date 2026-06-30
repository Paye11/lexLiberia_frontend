import {
  Landmark,
  Scale,
  Gavel,
  ShieldAlert,
  Building2,
  Home,
  Briefcase,
  Receipt,
  TrendingUp,
  Vote,
  Leaf,
  BookMarked,
  FileText,
  FileSignature,
  type LucideIcon,
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  Landmark,
  Scale,
  Gavel,
  ShieldAlert,
  Building2,
  Home,
  Briefcase,
  Receipt,
  TrendingUp,
  Vote,
  Leaf,
  BookMarked,
  FileText,
  FileSignature,
}

export function CategoryIcon({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const Icon = iconMap[name] ?? FileText
  return <Icon className={className} />
}
