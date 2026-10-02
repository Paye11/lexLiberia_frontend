'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

type SwitchProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'checked' | 'defaultChecked' | 'onChange'
> & {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { className, checked, defaultChecked, onCheckedChange, disabled, id, ...props },
  ref,
) {
  const [internal, setInternal] = React.useState<boolean>(Boolean(defaultChecked))
  const isControlled = checked !== undefined
  const isOn = isControlled ? Boolean(checked) : internal

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const next = event.target.checked
    if (!isControlled) setInternal(next)
    onCheckedChange?.(next)
  }

  return (
    <span
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
        isOn ? 'bg-primary' : 'bg-input',
        className,
      )}
      data-state={isOn ? 'checked' : 'unchecked'}
    >
      <span
        className={cn(
          'pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform',
          isOn ? 'translate-x-4' : 'translate-x-0',
        )}
      />
      <input
        ref={ref}
        id={id}
        type="checkbox"
        role="switch"
        aria-checked={isOn}
        checked={isOn}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onChange={handleChange}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
        {...props}
      />
    </span>
  )
})

export { Switch }
