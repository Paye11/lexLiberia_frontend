import type { Metadata } from 'next'
import { AskMeChat } from '@/components/ai/ask-me-chat'

export const metadata: Metadata = {
  title: 'Ask Me',
  description:
    'Ask Me searches LexLiberia uploads, Liberian judiciary sources, and the wider web.',
}

export default function AskMePage() {
  return <AskMeChat />
}
