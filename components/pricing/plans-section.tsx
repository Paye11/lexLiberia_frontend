'use client'

import { useState } from 'react'
import { SectionHeading } from '@/components/section-heading'
import { PricingCard } from '@/components/cards/pricing-card'
import { cn } from '@/lib/utils'
import type { BillingCycle, Plan } from '@/types'

export function PlansSection({
  plans,
  showHeading = true,
  className,
}: {
  plans: Plan[]
  showHeading?: boolean
  className?: string
}) {
  const [billing, setBilling] = useState<BillingCycle>('monthly')

  return (
    <section className={cn('border-b border-border', className)}>
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        {showHeading && (
          <SectionHeading
            eyebrow="Subscription Plans"
            title="Choose the right plan for you"
            description="Flexible pricing for citizens, students, lawyers, and institutions."
          />
        )}

        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setBilling('monthly')}
            className={cn(
              'px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300',
              billing === 'monthly'
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            )}
          >
            Monthly
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setBilling('annual')}
              className={cn(
                'px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300',
                billing === 'annual'
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              Annual
            </button>
            <span className="rounded-full bg-success/20 px-3 py-1 text-xs font-bold text-success">
              Save 5%
            </span>
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, i) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              billing={billing}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
