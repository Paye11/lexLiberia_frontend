'use client'

import { useMemo } from 'react'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowUp,
  BookOpen,
  Check,
  Copy,
  FileText,
  Gavel,
  GitCompare,
  Loader2,
  Lock,
  MessageSquarePlus,
  Paperclip,
  Scale,
  Search as SearchIcon,
  Sparkles,
  Ticket,
  Globe,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ChatMessage } from '@/types'
import {
  askLegalResearch,
  getAccessProfile,
  getStoredUser,
  type UserAccess,
} from '@/lib/api-client'
import { cn } from '@/lib/utils'
import { MarkdownView } from '@/lib/markdown'

type TaskMode = 'research' | 'draft' | 'review' | 'explain' | 'compare'

const TASK_MODES: {
  value: TaskMode
  label: string
  icon: typeof Sparkles
  hint: string
}[] = [
  { value: 'research', label: 'Research', icon: SearchIcon, hint: 'Find Liberian law with citations' },
  { value: 'draft', label: 'Draft', icon: FileText, hint: 'Motions, affidavits, contracts, letters' },
  { value: 'review', label: 'Review', icon: Gavel, hint: 'Strengths, weaknesses, next steps' },
  { value: 'explain', label: 'Explain', icon: Scale, hint: 'Plain language + detailed law' },
  { value: 'compare', label: 'Compare', icon: GitCompare, hint: 'Side-by-side comparisons' },
]

const SUGGESTIONS_BY_MODE: Record<
  TaskMode,
  { icon: typeof Sparkles; items: string[] }
> = {
  research: {
    icon: SearchIcon,
    items: [
      'What are the grounds for divorce under the Domestic Relations Law?',
      'Explain the penalties for theft and aggravated theft under the Penal Law.',
      'What fundamental rights does the 1986 Constitution guarantee?',
      'How is a commercial contract formed and enforced in Liberia?',
    ],
  },
  draft: {
    icon: FileText,
    items: [
      'Draft a Magistrate Court complaint for breach of contract worth USD 5,000.',
      'Prepare an affidavit of means in support of a motion for bail.',
      'Write a demand letter for 8 months unpaid rent, quoting the relevant law.',
      'Prepare a deed of gift for a parcel of land in Montserrado County.',
    ],
  },
  review: {
    icon: Gavel,
    items: [
      'Review this complaint — strengths, weaknesses, and chances of success?',
      'Check this affidavit for legal and formal defects before I file it.',
      'Comment on this contract — any clauses I should renegotiate?',
      'Is this employment letter compliant with Liberian labour law?',
    ],
  },
  explain: {
    icon: Scale,
    items: [
      'Explain habeas corpus simply, then with Liberian authorities.',
      'What does "due process of law" mean under the 1986 Constitution?',
      'Break down "criminal conspiracy" for a non-lawyer.',
      'Explain Liberian land tenure: customary vs. deed, in simple terms.',
    ],
  },
  compare: {
    icon: GitCompare,
    items: [
      'Compare Magistrate Court vs. Circuit Court — jurisdiction, procedure, remedies.',
      'Compare Murder first degree vs. Manslaughter under the Penal Law.',
      'Compare a lease vs. a licence to occupy land in Liberia.',
      'Compare registering a business name vs. incorporating a company.',
    ],
  },
}

const MODE_PREFIX: Record<TaskMode, string> = {
  research: '[Mode: Research] ',
  draft: '[Mode: Draft] Please draft a complete, Liberian-style document. ',
  review:
    '[Mode: Review] Please read the attachment and give a structured legal review. ',
  explain:
    '[Mode: Explain] Please answer in two layers: Layman Summary then Detailed Legal Explanation. ',
  compare:
    '[Mode: Compare] Please present the answer as a side-by-side comparison then a recommendation. ',
}

const MODE_ACCEPT =
  '.pdf,.doc,.docx,.txt,.rtf,.odt,.jpg,.jpeg,.png,.webp,.gif,.heic,.tif,.tiff,image/*'

export function ResearchChat({
  assistantName = 'LexLiberia AI',
  title = 'AI Legal Research Assistant',
  description = 'Ask questions in plain language. Pick a task mode: Research, Draft, Review, Explain, or Compare. The assistant searches Liberian statutes, uploaded documents, Supreme Court opinions, and authoritative web sources, and produces clean Liberian-style answers with citations. Always verify important answers with the official sources.',
  lockedTitle = 'AI Research requires a paid plan (Student or above)',
  suggestions,
  ask = askLegalResearch,
  otherAssistant,
}: {
  assistantName?: string
  title?: string
  description?: string
  lockedTitle?: string
  suggestions?: string[]
  ask?: typeof askLegalResearch
  otherAssistant?: { href: string; label: string }
} = {}) {
  const [mode, setMode] = useState<TaskMode>('research')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const [attachment, setAttachment] = useState<File | null>(null)
  const [attachmentError, setAttachmentError] = useState('')
  const [access, setAccess] = useState<UserAccess | null>(null)
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    async function loadAccess() {
      const stored = getStoredUser()
      if (stored?.access) {
        setAccess(stored.access)
        setCheckingAccess(false)
        return
      }

      if (!stored) {
        setAccess(null)
        setCheckingAccess(false)
        return
      }

      try {
        const profile = await getAccessProfile()
        setAccess(profile.access)
      } catch {
        setAccess(stored.access ?? null)
      } finally {
        setCheckingAccess(false)
      }
    }

    loadAccess()
  }, [])

  const canResearch = access?.canUseAiResearch ?? false

  const activeSuggestions = suggestions ?? SUGGESTIONS_BY_MODE[mode].items
  const ActiveIcon = SUGGESTIONS_BY_MODE[mode].icon

  function scrollToBottom() {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      })
    })
  }

  useEffect(() => {
    const t = textareaRef.current
    if (!t) return
    t.style.height = 'auto'
    t.style.height = `${Math.min(t.scrollHeight, 200)}px`
  }, [input])

  function chooseAttachment(file: File | null) {
    setAttachmentError('')
    if (!file) {
      setAttachment(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    const extPattern =
      /\.(pdf|docx?|txt|rtf|odt|jpe?g|png|webp|gif|heic|tiff?)$/i
    const mimeOk = /pdf|word|officedocument|text\/|image\//i.test(file.type || '')
    if (!extPattern.test(file.name) && !mimeOk) {
      setAttachment(null)
      setAttachmentError(
        'Upload a PDF, Word, text file, or a clear image of the document.',
      )
      return
    }

    if (file.size > 15 * 1024 * 1024) {
      setAttachment(null)
      setAttachmentError('The file is larger than 15 MB. Compress it or try a smaller one.')
      return
    }

    setAttachment(file)
  }

  async function copyAssistant(messageId: string, content: string) {
    try {
      await navigator.clipboard.writeText(content)
      setCopiedId(messageId)
      setTimeout(() => setCopiedId((id) => (id === messageId ? null : id)), 1500)
    } catch {
      /* ignore */
    }
  }

  function resetConversation() {
    if (pending) return
    setMessages([])
    setInput('')
    setAttachment(null)
    setAttachmentError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || pending) return

    const file = attachment
    const prefixed = `${MODE_PREFIX[mode]}${trimmed}`
    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
      attachmentName: file?.name,
      metadata: { mode },
    }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setAttachment(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    setPending(true)
    scrollToBottom()

    const assistantId = `a-${Date.now()}`
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: 'assistant', content: '' },
    ])

    try {
      const result = await ask(prefixed, file ?? undefined)
      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantId
            ? {
                ...message,
                content: result.content,
                citations: result.citations,
                webSearchUsed: result.webSearchUsed,
                webSources: result.webSources,
              }
            : message,
        ),
      )
    } catch (error) {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantId
            ? {
                ...message,
                content:
                  error instanceof Error
                    ? error.message
                    : 'Unable to complete the request.',
              }
            : message,
        ),
      )
    } finally {
      setPending(false)
      scrollToBottom()
    }
  }

  const hasConversation = messages.length > 0

  const placeholder = useMemo(() => {
    switch (mode) {
      case 'research':
        return 'Ask a research question, e.g. "What is the limitation period for a debt action in Liberia?"'
      case 'draft':
        return 'Describe the document you want, with parties, facts, and the relief you seek.'
      case 'review':
        return 'Attach the document, then describe the review you want (merits, defects, risks…).'
      case 'explain':
        return 'Ask any legal concept or statute section to be explained simply.'
      case 'compare':
        return 'State the two things to compare, e.g. "Compare Magistrate Court vs. Circuit Court."'
    }
  }, [mode])

  if (checkingAccess) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!canResearch) {
    return (
      <section className="flex h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="max-w-lg text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Lock className="size-7" />
          </div>
          <h1 className="mt-6 font-heading text-2xl font-bold">{lockedTitle}</h1>
          <p className="mt-3 text-muted-foreground">
            Log in and subscribe to the Student plan (or above) to use this advanced
            AI for drafting, reviewing, explaining, comparing, and researching
            Liberian law. Admin accounts have full free access.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {!access?.isAuthenticated ? (
              <>
                <Button render={<Link href="/login" />}>Login</Button>
                <Button variant="outline" render={<Link href="/register" />}>
                  Create Account
                </Button>
              </>
            ) : (
              <>
                <Button render={<Link href="/pricing" />}>View Plans</Button>
                <Button variant="outline" render={<Link href="/account" />}>
                  <Ticket className="size-4" />
                  Redeem Coupon
                </Button>
              </>
            )}
          </div>
        </div>
      </section>
    )
  }

  function ModeChips({ compact = false }: { compact?: boolean }) {
    return (
      <div
        role="tablist"
        aria-label="Task mode"
        className={cn(
          'inline-grid items-center gap-1 rounded-xl border border-border bg-card p-1 shadow-sm',
          compact ? 'grid-cols-5' : 'w-full max-w-xl mx-auto grid-cols-5',
        )}
      >
        {TASK_MODES.map((t) => {
          const active = mode === t.value
          return (
            <button
              key={t.value}
              type="button"
              role="tab"
              aria-selected={active}
              title={t.hint}
              onClick={() => setMode(t.value)}
              className={cn(
                'inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors sm:text-sm',
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <t.icon className="size-3.5 sm:size-4" />
              {t.label}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto" aria-live="polite">
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
          {!hasConversation ? (
            <div className="flex flex-col items-center pt-6 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 text-primary shadow-sm ring-1 ring-border">
                <Sparkles className="size-7" />
              </div>
              <h1 className="mt-5 font-heading text-2xl font-bold tracking-tight text-foreground text-balance sm:text-3xl">
                {title}
              </h1>
              <p className="mt-3 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
              {otherAssistant ? (
                <Link
                  href={otherAssistant.href}
                  className="mt-3 text-sm text-primary hover:underline"
                >
                  {otherAssistant.label}
                </Link>
              ) : null}

              <div className="mt-6 w-full">
                <ModeChips />
              </div>

              <p className="mt-3 text-xs text-muted-foreground">
                {TASK_MODES.find((t) => t.value === mode)?.hint}
              </p>

              <div className="mt-6 grid w-full gap-3 sm:grid-cols-2">
                {activeSuggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="group rounded-xl border border-border bg-card p-4 text-left text-sm text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent/60 hover:shadow-md"
                  >
                    <div className="mb-2 inline-flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <ActiveIcon className="size-4" />
                    </div>
                    <p className="leading-relaxed">{s}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 pb-4">
              <div className="flex items-center justify-between gap-3 pb-1">
                <div
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-foreground shadow-sm',
                  )}
                >
                  {(() => {
                    const firstMode = (messages[0].metadata?.mode ??
                      mode) as TaskMode
                    const task = TASK_MODES.find((t) => t.value === firstMode)
                    const Icon = task?.icon ?? SearchIcon
                    return (
                      <>
                        <Icon className="size-3.5 text-primary" />
                        {task?.label ?? 'Research'} mode
                      </>
                    )
                  })()}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetConversation}
                  disabled={pending}
                >
                  <MessageSquarePlus className="size-3.5" />
                  New chat
                </Button>
              </div>

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
                      <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-sm leading-relaxed text-primary-foreground shadow-sm">
                        {m.metadata?.mode && m.metadata.mode !== 'research' ? (
                          <div className="mb-1 inline-flex items-center gap-1 rounded-full bg-primary-foreground/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary-foreground/90">
                            {(() => {
                              const t = TASK_MODES.find(
                                (x) => x.value === m.metadata!.mode,
                              )
                              const Icon = t?.icon ?? SearchIcon
                              return (
                                <>
                                  <Icon className="size-3" />
                                  {t?.label ?? 'Research'}
                                </>
                              )
                            })()}
                          </div>
                        ) : null}
                        {m.content}
                        {m.attachmentName ? (
                          <p className="mt-2 flex items-center gap-1.5 text-xs opacity-90">
                            <Paperclip className="size-3" />
                            {m.attachmentName}
                          </p>
                        ) : null}
                      </div>
                    ) : (
                      <div className="w-full max-w-[92%]">
                        <div className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                          <Sparkles className="size-3.5 text-secondary" />
                          {assistantName}
                          {m.webSearchUsed && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-[11px] text-primary">
                              <Globe className="size-3" />
                              Web search enabled
                            </span>
                          )}
                        </div>
                        <div className="relative rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-4 text-sm leading-relaxed text-foreground shadow-sm">
                          {m.content ? (
                            <>
                              <MarkdownView source={m.content} className="prose-ai" />
                              <div className="mt-4 flex items-center justify-end">
                                <button
                                  type="button"
                                  onClick={() => copyAssistant(m.id, m.content)}
                                  className={cn(
                                    'inline-flex h-7 items-center gap-1.5 rounded-lg px-2 text-[11px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                                  )}
                                >
                                  {copiedId === m.id ? (
                                    <>
                                      <Check className="size-3.5 text-emerald-500" />
                                      Copied
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="size-3.5" />
                                      Copy answer
                                    </>
                                  )}
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Loader2 className="size-4 animate-spin" />
                              Thinking — searching Liberian sources and the web…
                            </div>
                          )}

                          {m.webSources?.length ? (
                            <div className="mt-3 border-t border-border pt-3">
                              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                Web sources
                              </p>
                              <ul className="grid gap-1.5 sm:grid-cols-2">
                                {m.webSources.map((s, idx) => (
                                  <li key={idx}>
                                    <a
                                      href={s.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-start gap-2 text-xs text-primary hover:underline"
                                    >
                                      <Globe className="mt-0.5 size-3.5 shrink-0" />
                                      <span className="line-clamp-2 font-medium">
                                        {s.title}
                                      </span>
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : null}

                          {m.citations?.length ? (
                            <div className="mt-3 border-t border-border pt-3">
                              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                                LexLiberia sources
                              </p>
                              <ul className="grid gap-1.5 sm:grid-cols-2">
                                {m.citations.map((c) => (
                                  <li key={c.href}>
                                    <a
                                      href={c.href}
                                      className="inline-flex items-start gap-2 text-xs text-primary hover:underline"
                                    >
                                      <BookOpen className="mt-0.5 size-3.5 shrink-0" />
                                      <span>
                                        <span className="font-medium">{c.title}</span>{' '}
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
        <div className="mx-auto max-w-4xl px-4 py-3 sm:px-6 sm:py-4">
          <div className="mb-2 hidden items-center justify-between sm:flex">
            <ModeChips compact />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetConversation}
              disabled={pending || !hasConversation}
              className="shrink-0"
            >
              <MessageSquarePlus className="size-3.5" />
              New
            </Button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
            className="rounded-2xl border border-border bg-card p-2 shadow-sm focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10"
          >
            {attachment ? (
              <div className="mb-2 flex items-center justify-between gap-2 rounded-xl bg-muted px-3 py-2 text-xs">
                <span className="inline-flex items-center gap-1.5 truncate">
                  <Paperclip className="size-3.5 text-muted-foreground" />
                  {attachment.name}
                  <span className="text-muted-foreground">
                    {(attachment.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </span>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Remove attachment"
                  onClick={() => chooseAttachment(null)}
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ) : null}
            <div className="flex items-end gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept={MODE_ACCEPT}
                className="hidden"
                onChange={(event) => chooseAttachment(event.target.files?.[0] ?? null)}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-9 shrink-0 rounded-xl"
                disabled={pending}
                aria-label="Attach a document or pleading"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="size-4" />
              </Button>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    send(input)
                  }
                }}
                rows={1}
                placeholder={placeholder}
                aria-label="Ask the legal assistant"
                className="max-h-52 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <Button
                type="submit"
                size="icon"
                className="size-9 shrink-0 rounded-xl"
                disabled={pending || !input.trim()}
                aria-label="Send message"
              >
                {pending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ArrowUp className="size-4" />
                )}
              </Button>
            </div>
          </form>
          {attachmentError ? (
            <p className="mt-2 text-center text-xs text-destructive">
              {attachmentError}
            </p>
          ) : null}
          <p className="mt-2 text-center text-[11px] leading-relaxed text-muted-foreground">
            Attach PDF, Word (.doc/.docx), .txt/.rtf/.odt, or a clear image. Max 15 MB.
            LexLiberia AI can make mistakes — verify important answers with official
            sources before relying on them.
          </p>
        </div>
      </div>
    </div>
  )
}
