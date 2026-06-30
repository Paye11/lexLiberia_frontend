import type { Metadata } from 'next'
import Link from 'next/link'
import { SectionHeading } from '@/components/section-heading'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How LexLiberia collects, uses, and protects your personal information.',
}

const sections = [
  {
    title: 'Information We Collect',
    body: 'We collect information you provide when registering an account, such as your name and email address. We also collect usage data including pages visited, search queries, and document views to improve the platform.',
  },
  {
    title: 'How We Use Your Information',
    body: 'Your information is used to provide and improve LexLiberia services, manage your subscription plan, authenticate your account, and communicate important updates about the platform.',
  },
  {
    title: 'Data Storage & Security',
    body: 'Account data is stored securely in encrypted databases. We use industry-standard security measures including HTTPS encryption and secure authentication tokens to protect your information.',
  },
  {
    title: 'Third-Party Services',
    body: 'We may use third-party services for hosting, analytics, and payment processing. These providers are bound by their own privacy policies and are only given access to data necessary to perform their services.',
  },
  {
    title: 'Your Rights',
    body: 'You may request access to, correction of, or deletion of your personal data at any time by contacting us. You may also close your account through the platform or by reaching out to our support team.',
  },
  {
    title: 'Contact Us',
    body: 'For privacy-related questions or requests, please contact us through our contact page or email support@lexliberia.com.',
  },
]

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="Legal"
        title="Privacy Policy"
        description="Last updated: June 2026. This policy describes how LexLiberia handles your personal information."
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
        <Link href="/terms" className="text-primary underline-offset-4 hover:underline">
          Terms of Service
        </Link>
        .
      </p>
    </div>
  )
}
