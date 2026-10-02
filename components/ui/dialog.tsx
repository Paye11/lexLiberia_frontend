'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type DialogContextValue = {
  open: boolean
  setOpen: (next: boolean) => void
}

const DialogContext = React.createContext<DialogContextValue | null>(null)

function useDialog() {
  const ctx = React.useContext(DialogContext)
  if (!ctx) throw new Error('Dialog components must be used inside a <Dialog>')
  return ctx
}

type DialogProps = {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (next: boolean) => void
  children: React.ReactNode
}

function Dialog({ open, defaultOpen, onOpenChange, children }: DialogProps) {
  const isControlled = open !== undefined
  const [internal, setInternal] = React.useState<boolean>(Boolean(defaultOpen))
  const isOpen = isControlled ? Boolean(open) : internal

  const value = React.useMemo<DialogContextValue>(
    () => ({
      open: isOpen,
      setOpen: (next: boolean) => {
        if (!isControlled) setInternal(next)
        onOpenChange?.(next)
      },
    }),
    [isOpen, isControlled, onOpenChange],
  )

  React.useEffect(() => {
    if (!isOpen) return undefined
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') value.setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [isOpen, value])

  return (
    <DialogContext.Provider value={value}>{children}</DialogContext.Provider>
  )
}

type DialogContentProps = {
  children: React.ReactNode
  className?: string
}

function DialogContent({ children, className }: DialogContentProps) {
  const { open, setOpen } = useDialog()
  return (
    <AnimatePresence>
      {open ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.16 }}
            className={cn(
              'relative z-10 w-full max-w-lg rounded-2xl border border-border bg-popover p-6 text-popover-foreground shadow-2xl',
              className,
            )}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground opacity-70 transition-opacity hover:opacity-100"
            >
              <X className="size-4" />
            </button>
            {children}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}

function DialogHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('mb-4 flex flex-col space-y-1.5', className)}>{children}</div>
}

function DialogFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
        className,
      )}
    >
      {children}
    </div>
  )
}

function DialogTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <h2 className={cn('font-heading text-xl font-semibold leading-none tracking-tight', className)}>
      {children}
    </h2>
  )
}

function DialogDescription({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <p className={cn('text-sm text-muted-foreground', className)}>{children}</p>
}

function DialogTrigger({
  children,
  asChild,
}: {
  children: React.ReactElement
  asChild?: boolean
}) {
  const { setOpen } = useDialog()
  return React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<any>, {
        onClick: (event: React.MouseEvent) => {
          ;(children.props as { onClick?: (event: React.MouseEvent) => void }).onClick?.(event)
          setOpen(true)
        },
      })
    : null
}

function DialogClose({
  children = <Button variant="outline" type="button">Close</Button>,
}: {
  children?: React.ReactElement
}) {
  const { setOpen } = useDialog()
  return React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<any>, {
        onClick: (event: React.MouseEvent) => {
          ;(children.props as { onClick?: (event: React.MouseEvent) => void }).onClick?.(event)
          setOpen(false)
        },
      })
    : null
}

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
}
