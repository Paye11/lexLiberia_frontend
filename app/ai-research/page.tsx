import type { Metadata } from 'next'
import { ResearchChat } from '@/components/ai/research-chat'

export const metadata: Metadata = {
  title: 'AI Legal Research',
  description:
    'Ask questions in plain language and get answers grounded in Liberian statutes and Supreme Court opinions, complete with citations.',
}

export default function AiResearchPage() {
  return <ResearchChat />
}
