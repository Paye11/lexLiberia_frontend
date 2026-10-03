import { Hero } from '@/components/home/hero'
import { QuickSearch } from '@/components/home/quick-search'
import { PublicNotices } from '@/components/home/public-notices'
import { FeaturedCategories } from '@/components/home/featured-categories'
import { LatestUpdates } from '@/components/home/latest-updates'
import { PlansSection } from '@/components/pricing/plans-section'
import { Testimonials } from '@/components/home/testimonials'
import { Newsletter } from '@/components/home/newsletter'
import { MobileCtaBar } from '@/components/home/mobile-cta-bar'
import { legalService } from '@/services/legal-service'
import {
  categories as fallbackCategories,
  legalUpdates as fallbackUpdates,
  plans as fallbackPlans,
  testimonials as fallbackTestimonials,
} from '@/lib/mock-data'

export const dynamic = 'force-dynamic'

function ensureArray<T>(value: unknown, fallback: readonly T[]): T[] {
  return Array.isArray(value) ? (value as T[]) : (fallback as T[])
}

export default async function HomePage() {
  const [categories, updates, plans, testimonials] = await Promise.all([
    legalService.getCategories().catch(() => fallbackCategories),
    legalService.getLegalUpdates().catch(() => fallbackUpdates),
    legalService.getPlans().catch(() => fallbackPlans),
    legalService.getTestimonials().catch(() => fallbackTestimonials),
  ])

  return (
    <>
      <Hero />
      <QuickSearch />
      <PublicNotices />
      <FeaturedCategories categories={ensureArray(categories, fallbackCategories)} />
      <LatestUpdates updates={ensureArray(updates, fallbackUpdates)} />
      <PlansSection plans={ensureArray(plans, fallbackPlans)} />
      <Testimonials testimonials={ensureArray(testimonials, fallbackTestimonials)} />
      <Newsletter />
      <div className="h-20 sm:hidden" />
      <MobileCtaBar />
    </>
  )
}
