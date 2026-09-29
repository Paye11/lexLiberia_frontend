'use client'

import { useEffect, useRef } from 'react'
import { loginWithGoogle } from '@/lib/api-client'

interface GoogleIdentity {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string
        callback: (response: { credential?: string }) => void
      }) => void
      renderButton: (
        parent: HTMLElement,
        options: Record<string, string | number>,
      ) => void
    }
  }
}

declare global {
  interface Window {
    google?: GoogleIdentity
  }
}

interface GoogleSignInProps {
  onSuccess: (role?: string) => void
  onError: (message: string) => void
}

export function GoogleSignIn({ onSuccess, onError }: GoogleSignInProps) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim()
  const buttonRef = useRef<HTMLDivElement>(null)
  const onSuccessRef = useRef(onSuccess)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    onSuccessRef.current = onSuccess
    onErrorRef.current = onError
  }, [onSuccess, onError])

  useEffect(() => {
    if (!clientId || !buttonRef.current) return

    let cancelled = false

    function renderButton() {
      if (cancelled || !buttonRef.current || !window.google?.accounts?.id) return

      window.google.accounts.id.initialize({
        client_id: clientId as string,
        callback: async (response) => {
          if (!response.credential) {
            onErrorRef.current('Google did not return an account.')
            return
          }

          try {
            const data = await loginWithGoogle(response.credential)
            onSuccessRef.current(data.user.role)
          } catch (error) {
            onErrorRef.current(
              error instanceof Error ? error.message : 'Google sign-in failed',
            )
          }
        },
      })

      buttonRef.current.innerHTML = ''
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        width: Math.max(buttonRef.current.offsetWidth, 280),
        text: 'continue_with',
        shape: 'rectangular',
      })
    }

    const existing = document.getElementById('google-gsi-client')
    if (existing) {
      renderButton()
      return () => {
        cancelled = true
      }
    }

    const script = document.createElement('script')
    script.id = 'google-gsi-client'
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = renderButton
    document.body.appendChild(script)

    return () => {
      cancelled = true
    }
  }, [clientId])

  if (!clientId) {
    if (typeof window !== 'undefined') {
      console.warn(
        '[GoogleSignIn] NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured. Google sign-in button is disabled. ' +
          'Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your .env.local file to enable Google Sign-In.',
      )
    }
    return (
      <p className="text-center text-sm text-muted-foreground">
        Google sign-in is disabled. Configure{' '}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code>{' '}
        to enable it.
      </p>
    )
  }

  return <div ref={buttonRef} className="flex min-h-10 justify-center" />
}
