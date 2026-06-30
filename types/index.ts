export interface Category {
  slug: string
  title: string
  description: string
  icon: string
  documentCount: number
}

export interface Law {
  id: string
  title: string
  category: string
  categorySlug: string
  type: 'Statute' | 'Regulation' | 'Executive Order' | 'Constitution'
  summary: string
  publishedDate: string
  year: number
  views: number
  chapter?: string
  sections?: { number: string; heading: string; body: string }[]
  content?: string
}

export interface Opinion {
  id: string
  caseName: string
  citation: string
  justice: string
  topic: string
  year: number
  date: string
  summary: string
  facts?: string
  issues?: string
  holding?: string
  opinion?: string
}

export interface LegalUpdate {
  id: string
  title: string
  category: string
  publishedDate: string
  description: string
}

export interface Testimonial {
  id: string
  name: string
  role: string
  institution: string
  quote: string
}

export type BillingCycle = 'monthly' | 'annual'

export interface Plan {
  id: string
  name: string
  description: string
  priceMonthly: number
  priceAnnual: number
  recommended?: boolean
  features: string[]
}

export interface FaqItem {
  question: string
  answer: string
}

export interface ChatCitation {
  title: string
  citation: string
  href: string
}

export interface WebSource {
  title: string
  url: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  citations?: ChatCitation[]
  webSearchUsed?: boolean
  webSources?: WebSource[]
}
