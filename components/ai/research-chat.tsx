'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp, BookOpen, Loader2, Scale, Sparkles, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ChatMessage } from '@/types'
import { generateMockAnswer } from '@/lib/ai-mock'

const suggestions = [
  'What are the grounds for divorce under Liberian law?',
  'Explain the penalties for theft under the Penal Law.',
  'What rights does the 1986 Constitution guarantee?',
  'How is a commercial contract enforced in Liberia?',
]

export function ResearchChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  function scrollToBottom() {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      })
    })
  }

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || pending) return

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
    }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setPending(true)
    scrollToBottom()

    const { content, citations, webSearchUsed, webSources } = generateMockAnswer(trimmed)
    const assistantId = `a-${Date.now()}`

    // Simulate streaming token-by-token.
    await new Promise((r) => setTimeout(r, 500))
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: 'assistant', content: '', webSearchUsed, webSources },
    ])

    const words = content.split(' ')
    for (let i = 0; i < words.length; i++) {
      await new Promise((r) => setTimeout(r, 18))
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: words.slice(0, i + 1).join(' ') }
            : m,
        ),
      )
      if (i % 6 === 0) scrollToBottom()
    }

    setMessages((prev) =>
      prev.map((m) => (m.id === assistantId ? { ...m, citations } : m)),
    )
    setPending(false)
    scrollToBottom()
  }

  const hasConversation = messages.length > 0

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
        aria-live="polite"
      >
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          {!hasConversation ? (
            <div className="flex flex-col items-center pt-8 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="size-7" />
              </div>
              <h1 className="mt-5 font-heading text-2xl font-bold text-foreground text-balance sm:text-3xl">
                AI Legal Research Assistant
              </h1>
              <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
                Ask questions in plain language. The assistant searches Liberian
                statutes, Supreme Court opinions, and legal resources on the web, 
                providing answers with citations and judgment formats.
                Always verify with the primary sources before relying on any
                answer.
              </p>
              <div className="mt-8 grid w-full gap-3 sm:grid-cols-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-xl border border-border bg-card p-4 text-left text-sm text-foreground shadow-sm transition-colors hover:border-primary/40 hover:bg-accent"
                  >
                    <Scale className="mb-2 size-4 text-secondary" />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <AnimatePresence initial={false}>
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={
                      m.role === 'user' ? 'flex justify-end' : 'flex justify-start'
                    }
                  >
                    {m.role === 'user' ? (
                      <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-sm leading-relaxed text-primary-foreground">
                        {m.content}
                      </div>
                    ) : (
                      <div className="max-w-[90%]">
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                          <Sparkles className="size-3.5 text-secondary" />
                          LexLiberia AI
                          {m.webSearchUsed && (
                            <span className="flex items-center gap-1 text-primary">
                              <Globe className="size-3" />
                              Web Search Enabled
                            </span>
                          )}
                        </div>
                        <div className="mt-2 rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3 text-sm leading-relaxed text-foreground">
                          {m.content || (
                            <Loader2 className="size-4 animate-spin text-muted-foreground" />
                          )}
                          
                          {/* Display web sources */}
                          {m.webSources?.length ? (
                            <div className="mt-4 border-t border-border pt-3">
                              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Web Sources
                              </p>
                              <ul className="space-y-1.5">
                                {m.webSources.map((s, idx) => (
                                  <li key={idx}>
                                    <a
                                      href={s.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-start gap-2 text-xs text-primary hover:underline"
                                    >
                                      <Globe className="mt-0.5 size-3.5 shrink-0" />
                                      <span className="font-medium">
                                        {s.title}
                                      </span>
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : null}

                          {/* Display citations */}
                          {m.citations?.length ? (
                            <div className="mt-4 border-t border-border pt-3">
                              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Legal Sources
                              </p>
                              <ul className="space-y-1.5">
                                {m.citations.map((c) => (
                                  <li key={c.href}>
                                    <a
                                      href={c.href}
                                      className="inline-flex items-start gap-2 text-xs text-primary hover:underline"
                                    >
                                      <BookOpen className="mt-0.5 size-3.5 shrink-0" />
                                      <span>
                                        <span className="font-medium">
                                          {c.title}
                                        </span>{' '}
                                        <span className="text-muted-foreground">
                                          — {c.citation}
                                        </span>
                                      </span>
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
            className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm focus-within:border-primary/50"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send(input)
                }
              }}
              rows={1}
              placeholder="Ask a legal question... The AI will search Liberian laws and the web!"
              aria-label="Ask a legal question"
              className="max-h-40 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <Button
              type="submit"
              size="icon"
              className="size-9 rounded-xl"
              disabled={pending || !input.trim()}
              aria-label="Send message"
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ArrowUp className="size-4" />
              )}
            </Button>
          </form>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            LexLiberia AI can make mistakes. Verify important information with the
            official sources.
          </p>
        </div>
      </div>
    </div>
  )
}
