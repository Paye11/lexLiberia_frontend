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
 *
 * NOTE: API_BASE_URL is intentionally aligned with lib/api-client.ts. Both
 * default to 'http://localhost:5000/api' when the env var is missing so that
 * login/register flows never silently differ from marketing-page flows.
 */
const _RAW_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000'
const API_BASE_URL = _RAW_URL.trim().replace(/\/+$/, '').replace(/\.+$/, '')

async function fetchJson<T>(path: string, fallback: T): Promise<T> {
  try {
    const url = `${API_BASE_URL}/api${path}`
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(2500),
    })
    if (!res.ok) throw new Error(`Request failed: ${res.status}`)
    return (await res.json()) as T
  } catch (error) {
    console.warn(
      `[legal-service] fetch failed for /api${path} (${API_BASE_URL}/api${path}); falling back to mock data.`,
      error instanceof Error ? error.message : error,
    )
    return fallback
  }
}

function sanitizeArray<T, U extends readonly T[]>(value: unknown, fallback: U): T[] {
  return Array.isArray(value) ? (value as T[]) : (fallback as T[])
}

export const legalService = {
  getCategories: () =>
    fetchJson<Category[]>('/categories', categories)
      .catch(() => categories)
      .then((data) => sanitizeArray<Category, typeof categories>(data, categories)),
  getLaws: () =>
    fetchJson<Law[]>('/laws', laws)
      .catch(() => laws)
      .then((data) => sanitizeArray<Law, typeof laws>(data, laws)),
  getLawById: (id: string) =>
    fetchJson<Law | undefined>(`/laws/${id}`, laws.find((l) => l.id === id)).catch(
      () => laws.find((l) => l.id === id),
    ),
  getOpinions: () =>
    fetchJson<Opinion[]>('/opinions', opinions)
      .catch(() => opinions)
      .then((data) => sanitizeArray<Opinion, typeof opinions>(data, opinions)),
  getOpinionById: (id: string) =>
    fetchJson<Opinion | undefined>(
      `/opinions/${id}`,
      opinions.find((o) => o.id === id),
    ).catch(() => opinions.find((o) => o.id === id)),
  getLegalUpdates: () =>
    fetchJson<LegalUpdate[]>('/updates', legalUpdates)
      .catch(() => legalUpdates)
      .then((data) => sanitizeArray<LegalUpdate, typeof legalUpdates>(data, legalUpdates)),
  getTestimonials: () =>
    fetchJson<Testimonial[]>('/testimonials', testimonials)
      .catch(() => testimonials)
      .then((data) =>
        sanitizeArray<Testimonial, typeof testimonials>(data, testimonials),
      ),
  async getPlans() {
    try {
      const planData = !API_BASE_URL ? null : await fetchPlans().catch(() => null)
      const list = Array.isArray(planData) && planData.length > 0 ? planData : plans
      return sanitizeArray<Plan, typeof plans>(
        list.map((plan: Record<string, unknown>) => ({
          id: String(plan._id ?? plan.id ?? ''),
          name: String(plan.name ?? ''),
          description: String(plan.description ?? ''),
          priceMonthly: Number(plan.priceMonthly ?? 0),
          priceAnnual: Number(plan.priceAnnual ?? 0),
          recommended: Boolean(plan.recommended),
          features: Array.isArray(plan.features)
            ? plan.features.map((feature) => String(feature))
            : [],
        })),
        plans,
      )
    } catch (error) {
      console.error('[lexliberia] failed to fetch plans from backend:', error)
      return plans
    }
  },
  getFaqs: () =>
    fetchJson<FaqItem[]>('/faqs', faqs)
      .catch(() => faqs)
      .then((data) => sanitizeArray<FaqItem, typeof faqs>(data, faqs)),
}
