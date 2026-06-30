import { Hero } from '@/components/home/hero'
import { QuickSearch } from '@/components/home/quick-search'
import { FeaturedCategories } from '@/components/home/featured-categories'
import { LatestUpdates } from '@/components/home/latest-updates'
import { PlansSection } from '@/components/pricing/plans-section'
import { Testimonials } from '@/components/home/testimonials'
import { Newsletter } from '@/components/home/newsletter'
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
      <FeaturedCategories categories={categories} />
      <LatestUpdates updates={updates} />
      <PlansSection plans={plans} />
      <Testimonials testimonials={testimonials} />
      <Newsletter />
    </>
  )
}
