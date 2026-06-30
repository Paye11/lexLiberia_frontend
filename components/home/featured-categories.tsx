import { CategoryCard } from '@/components/cards/category-card'
import { SectionHeading } from '@/components/section-heading'
import type { Category } from '@/types'

export function FeaturedCategories({
  categories,
}: {
  categories: Category[]
}) {
  return (
    <section id="categories" className="scroll-mt-20 border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Browse the Library"
          title="Featured Categories"
          description="Explore Liberian legal materials organized by practice area and document type."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category, i) => (
            <CategoryCard key={category.slug} category={category} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
