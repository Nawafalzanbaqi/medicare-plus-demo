'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export type FilterOption<V extends string = string> = {
  value: V
  label: string
}

type Props<V extends string> = {
  label: string
  options: FilterOption<V>[]
  selected: V[]
  onChange: (next: V[]) => void
  /** When true, only one option may be selected at a time (radio behaviour). */
  single?: boolean
  /** Used to show "N selected" / "{label}" on the trigger. */
  selectedCountTemplate: (n: number) => string
  className?: string
}

export function FilterDropdown<V extends string>({
  label,
  options,
  selected,
  onChange,
  single = false,
  selectedCountTemplate,
  className,
}: Props<V>) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDocClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [open])

  const toggle = (value: V) => {
    if (single) {
      onChange([value])
      setOpen(false)
      return
    }
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value],
    )
  }

  const triggerLabel =
    selected.length === 0
      ? label
      : single
        ? options.find((o) => o.value === selected[0])?.label ?? label
        : `${label} · ${selectedCountTemplate(selected.length)}`

  return (
    <div ref={wrapperRef} className={cn('relative inline-block', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(
          'inline-flex h-10 items-center gap-2 rounded-lg border bg-white px-3 text-sm font-medium transition-colors',
          selected.length > 0
            ? 'border-teal-deep text-teal-deep'
            : 'border-line text-teal-deep/80 hover:border-teal-deep/40',
        )}
      >
        <span className="max-w-[12rem] truncate">{triggerLabel}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform',
            open && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute z-30 mt-2 max-h-72 w-56 overflow-auto rounded-xl border border-line bg-white p-1 shadow-medium"
          style={{ insetInlineStart: 0 }}
        >
          {options.map((opt) => {
            const isSelected = selected.includes(opt.value)
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => toggle(opt.value)}
                className={cn(
                  'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                  isSelected
                    ? 'bg-cream font-semibold text-teal-deep'
                    : 'text-ink/80 hover:bg-cream/60',
                )}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <Check className="h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
