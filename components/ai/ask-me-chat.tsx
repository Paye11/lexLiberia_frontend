'use client'

import { ResearchChat } from '@/components/ai/research-chat'
import { askMe } from '@/lib/api-client'

const suggestions = [
  'What does the Penal Law say about theft?',
  'Find Supreme Court opinions on land disputes.',
  'Search LiberLII for the Civil Procedure Law.',
  'What Liberian rules apply to a commercial contract?',
]

export function AskMeChat() {
  return (
    <ResearchChat
      assistantName="Ask Me"
      title="Ask Me"
      description="Ask Me searches laws uploaded on LexLiberia first, then the Supreme Court opinions at judiciary.gov.lr, LiberLII, and the wider web. You can attach a pleading. Verify important answers with the official sources."
      lockedTitle="Ask Me is for the admin only"
      suggestions={suggestions}
      ask={askMe}
      otherAssistant={{ href: '/ai-research', label: 'Or open AI Research' }}
    />
  )
}
