import type { Metadata } from 'next'
import Link from 'next/link'
import { SectionHeading } from '@/components/section-heading'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions for using the LexLiberia legal research platform.',
}

const sections = [
  {
    title: 'Acceptance of Terms',
    body: 'By accessing or using LexLiberia, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.',
  },
  {
    title: 'Use of the Platform',
    body: 'LexLiberia provides legal research tools and access to Liberian legal materials for informational and educational purposes. You may not reproduce, redistribute, or resell platform content without permission.',
  },
  {
    title: 'Accounts & Subscriptions',
    body: 'You are responsible for maintaining the confidentiality of your account credentials. Subscription plans define daily document view limits and feature access. Plan changes and billing are subject to the pricing terms displayed on the platform.',
  },
  {
    title: 'Disclaimer',
    body: 'LexLiberia is a research tool, not a law firm. Content on the platform does not constitute legal advice. Always consult a qualified attorney for legal matters specific to your situation.',
  },
  {
    title: 'Intellectual Property',
    body: 'Platform design, branding, and original content are owned by LexLiberia. Legal documents sourced from official records remain subject to applicable public domain and copyright laws.',
  },
  {
    title: 'Limitation of Liability',
    body: 'LexLiberia is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the platform or reliance on its content.',
  },
  {
    title: 'Changes to Terms',
    body: 'We may update these terms from time to time. Continued use of the platform after changes are posted constitutes acceptance of the revised terms.',
  },
]

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Legal"
        title="Terms of Service"
        description="Last updated: June 2026. Please read these terms carefully before using LexLiberia."
      />
      <div className="mt-12 space-y-10">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="font-heading text-xl font-semibold text-foreground">
              {section.title}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              {section.body}
            </p>
          </section>
        ))}
      </div>
      <p className="mt-12 text-sm text-muted-foreground">
        See also our{' '}
        <Link href="/privacy" className="text-primary underline-offset-4 hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  )
}
