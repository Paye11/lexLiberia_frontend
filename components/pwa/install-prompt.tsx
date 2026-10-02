'use client'

import { useEffect, useState } from 'react'
import { Monitor, Smartphone, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator &&
      Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)) ||
      window.matchMedia('(display-mode: window-controls-overlay)').matches
  )
}

function isIos() {
  return /iPhone|iPad|iPod/i.test(window.navigator.userAgent)
}

function isAndroid() {
  return /Android/i.test(window.navigator.userAgent)
}

function isMobileDevice() {
  const mobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    window.navigator.userAgent,
  )
  const narrow = window.matchMedia('(max-width: 900px)').matches
  return mobile || narrow
}

export function InstallPrompt() {
  const [visible, setVisible] = useState(false)
  const [iosHelp, setIosHelp] = useState(false)
  const [manualHelp, setManualHelp] = useState(false)
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissedOnce, setDismissedOnce] = useState(false)

  useEffect(() => {
    if (isStandalone() || dismissedOnce) return

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    const onPrompt = (event: Event) => {
      event.preventDefault()
      setDeferred(event as BeforeInstallPromptEvent)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', onPrompt)

    if (isIos()) {
      setIosHelp(true)
      setVisible(true)
    } else {
      setTimeout(() => {
        if (isStandalone()) return
        if (deferred) return
        setVisible(true)
      }, 3500)
    }

    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [dismissedOnce, deferred])

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

  function closeOnce() {
    setVisible(false)
    setDismissedOnce(true)
  }

  if (!visible) return null

  const onDesktop = !isMobileDevice()

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] p-3 sm:p-4">
      <div className="mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-border bg-[#090f1c] p-3 text-white shadow-2xl">
        <img
          src="/icons/logo.png"
          alt="LexLiberia"
          className="h-12 w-auto shrink-0 rounded-md"
        />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-sm font-semibold">
            {onDesktop ? (
              <Monitor className="size-3.5 text-white/70" />
            ) : (
              <Smartphone className="size-3.5 text-white/70" />
            )}
            Install LexLiberia {onDesktop ? 'App' : ''}
          </p>
          <p className="mt-0.5 text-xs leading-snug text-white/70">
            {iosHelp
              ? 'Tap the Share button, then choose Add to Home Screen.'
              : manualHelp
                ? onDesktop
                  ? 'Click the install icon in your address bar or open the browser menu and choose Install app.'
                  : isAndroid()
                    ? 'Open the browser menu and choose Install app or Add to Home Screen.'
                    : 'Open the browser menu and choose Install app or Add to Home Screen.'
                : onDesktop
                  ? 'Install LexLiberia as a desktop app and open it anytime from your computer.'
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
          onClick={closeOnce}
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}
