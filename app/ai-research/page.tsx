import { ResearchChat } from '@/components/ai/research-chat'

export const dynamic = 'force-dynamic'

export default function AiResearchPage() {
  return (
    <ResearchChat
      otherAssistant={{ href: '/ask-me', label: 'Or open Ask Me (Perplexity Sonar)' }}
    />
  )
}
