import {
  categories,
  faqs,
  laws,
  legalUpdates,
  opinions,
  plans,
  testimonials,
} from '@/lib/mock-data'
import { fetchPlans } from '@/lib/api-client'
import type {
  Category,
  FaqItem,
  Law,
  LegalUpdate,
  Opinion,
  Plan,
  Testimonial,
} from '@/types'

/**
 * REST-ready service layer.
 *
 * Set NEXT_PUBLIC_API_BASE_URL to point at the real backend. When it is
 * defined, requests are made against `${API_BASE_URL}/<resource>`. When it is
 * not defined, the functions fall back to local mock data so the UI is fully
 * functional during development.
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

async function fetchJson<T>(path: string, fallback: T): Promise<T> {
  if (!API_BASE_URL) return fallback
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 300 },
    })
    if (!res.ok) throw new Error(`Request failed: ${res.status}`)
    return (await res.json()) as T
  } catch (error) {
    console.error(`[v0] legal-service fetch failed for ${path}:`, error)
    return fallback
  }
}

export const legalService = {
  getCategories: () => fetchJson<Category[]>('/categories', categories),
  getLaws: () => fetchJson<Law[]>('/laws', laws),
  getLawById: (id: string) =>
    fetchJson<Law | undefined>(`/laws/${id}`, laws.find((l) => l.id === id)),
  getOpinions: () => fetchJson<Opinion[]>('/opinions', opinions),
  getOpinionById: (id: string) =>
    fetchJson<Opinion | undefined>(
      `/opinions/${id}`,
      opinions.find((o) => o.id === id),
    ),
  getLegalUpdates: () => fetchJson<LegalUpdate[]>('/updates', legalUpdates),
  getTestimonials: () =>
    fetchJson<Testimonial[]>('/testimonials', testimonials),
  async getPlans() {
    if (!API_BASE_URL) {
      return plans
    }

    try {
      const planData = await fetchPlans()
      if (!Array.isArray(planData) || planData.length === 0) {
        return plans
      }

      return planData.map((plan: Record<string, unknown>) => ({
        id: String(plan._id ?? plan.id ?? ''),
        name: String(plan.name ?? ''),
        description: String(plan.description ?? ''),
        priceMonthly: Number(plan.priceMonthly ?? 0),
        priceAnnual: Number(plan.priceAnnual ?? 0),
        recommended: Boolean(plan.recommended),
        features: Array.isArray(plan.features)
          ? plan.features.map((feature) => String(feature))
          : [],
      })) satisfies Plan[]
    } catch (error) {
      console.error('[lexliberia] failed to fetch plans from backend:', error)
      return plans
    }
  },
  getFaqs: () => fetchJson<FaqItem[]>('/faqs', faqs),
}
