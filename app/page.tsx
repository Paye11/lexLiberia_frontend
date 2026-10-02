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

export default async function HomePage() {
  const [categories, updates, plans, testimonials] = await Promise.all([
    legalService.getCategories(),
    legalService.getLegalUpdates(),
    legalService.getPlans(),
    legalService.getTestimonials(),
  ])

  return (
    <>
      <Hero />
      <QuickSearch />
      <PublicNotices />
      <FeaturedCategories categories={categories} />
      <LatestUpdates updates={updates} />
      <PlansSection plans={plans} />
      <Testimonials testimonials={testimonials} />
      <Newsletter />
      <div className="h-20 sm:hidden" />
      <MobileCtaBar />
    </>
  )
}
