'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator &&
      Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone))
  )
}

function isPhone() {
  const narrow = window.matchMedia('(max-width: 900px)').matches
  const mobile = /Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent)
  return narrow || mobile
}

export function InstallPrompt() {
  const [visible, setVisible] = useState(false)
  const [iosHelp, setIosHelp] = useState(false)
  const [manualHelp, setManualHelp] = useState(false)
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (!isPhone() || isStandalone()) return

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    const onPrompt = (event: Event) => {
      event.preventDefault()
      setDeferred(event as BeforeInstallPromptEvent)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', onPrompt)
    const ios = /iPhone|iPad|iPod/i.test(window.navigator.userAgent)
    if (ios || /Android/i.test(window.navigator.userAgent)) {
      setIosHelp(ios)
      setVisible(true)
    }

    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  async function install() {
    if (!deferred) {
      setManualHelp(true)
      return
    }

    await deferred.prompt()
    const choice = await deferred.userChoice
    setDeferred(null)
    if (choice.outcome === 'accepted') setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] p-3 sm:p-4">
      <div className="mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-border bg-[#090f1c] p-3 text-white shadow-2xl">
        <img
          src="/icons/logo.png"
          alt="LexLiberia"
          className="h-12 w-auto shrink-0 rounded-md"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Install LexLiberia</p>
          <p className="mt-0.5 text-xs leading-snug text-white/70">
            {iosHelp
              ? 'Tap the Share button, then choose Add to Home Screen.'
              : manualHelp
                ? 'Open the browser menu and choose Install app or Add to Home Screen.'
                : 'Add LexLiberia to your home screen and open it like an app.'}
          </p>
          {!iosHelp ? (
            <Button type="button" className="mt-2 h-8" onClick={install}>
              Install
            </Button>
          ) : null}
        </div>
        <button
          type="button"
          className="rounded-md p-1 text-white/70 hover:text-white"
          aria-label="Close install prompt"
          onClick={() => setVisible(false)}
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}
