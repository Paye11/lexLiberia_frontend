'use client'

import { ResearchChat } from '@/components/ai/research-chat'
import { askMe } from '@/lib/api-client'

export function AskMeChat() {
  return (
    <ResearchChat
      assistantName="Ask Me"
      title="Ask Me — Advanced Legal Search"
      description="Pick a task mode (Research, Draft, Review, Explain, or Compare) and Ask Me will search Liberian authorities first — LexLiberia uploads, then the Supreme Court of Liberia at judiciary.gov.lr, then LiberLII, then the wider web — and produce a clean, cited answer. You can attach a PDF, Word document, text file, or clear photo of a pleading to review or draft from."
      lockedTitle="Ask Me requires a paid plan (Student or above)"
      ask={askMe}
      otherAssistant={{ href: '/ai-research', label: 'Or open AI Research (OpenAI GPT)' }}
    />
  )
}
