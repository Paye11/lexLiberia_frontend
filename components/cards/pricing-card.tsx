'use client'

import { motion } from 'framer-motion'
import { Check, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { BillingCycle, Plan } from '@/types'

export function PricingCard({
  plan,
  billing,
  index = 0,
}: {
  plan: Plan
  billing: BillingCycle
  index?: number
}) {
  const price = billing === 'monthly' ? plan.priceMonthly : plan.priceAnnual
  const isFree = price === 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.06, 0.3) }}
      className={cn(
        'relative flex flex-col rounded-2xl border bg-card p-6 shadow-sm',
        plan.recommended
          ? 'border-primary ring-2 ring-primary/30'
          : 'border-border',
      )}
    >
      {plan.recommended && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
          <Star className="size-3.5 fill-current" />
          Recommended
        </Badge>
      )}

      <h3 className="font-heading text-lg font-bold">{plan.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>

      <div className="mt-5 flex items-end gap-1">
        <span className="font-heading text-4xl font-extrabold">
          ${price}
        </span>
        {!isFree && (
          <span className="mb-1 text-sm text-muted-foreground">
            /{billing === 'monthly' ? 'mo' : 'yr'}
          </span>
        )}
      </div>

      <Button
        className="mt-5 h-10"
        variant={plan.recommended ? 'default' : 'outline'}
      >
        {isFree ? 'Get Started' : `Subscribe to ${plan.name}`}
      </Button>

      <ul className="mt-6 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm">
            <Check className="mt-0.5 size-4 shrink-0 text-success" />
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  )
}
