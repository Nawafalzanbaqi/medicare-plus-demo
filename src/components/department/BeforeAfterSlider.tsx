'use client'

import Image from 'next/image'
import { useCallback, useRef, useState } from 'react'
import { ArrowLeftRight } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

type Props = {
  beforeSrc: string
  afterSrc: string
  beforeAlt: string
  afterAlt: string
  caption: string
  duration: string
  /** Aspect ratio of the slider frame. Defaults to 4/3. */
  aspect?: 'video' | 'square' | '4/3' | '16/10'
}

const ASPECT_CLASS: Record<NonNullable<Props['aspect']>, string> = {
  video: 'aspect-video',
  square: 'aspect-square',
  '4/3': 'aspect-[4/3]',
  '16/10': 'aspect-[16/10]',
}

export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeAlt,
  afterAlt,
  caption,
  duration,
  aspect = '4/3',
}: Props) {
  const t = useTranslations('departments.common.gallery')
  const locale = useLocale()
  const isRtl = locale === 'ar'

  const containerRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)
  const [pos, setPos] = useState(50)

  const updateFromPointer = useCallback((clientX: number) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const raw = ((clientX - rect.left) / rect.width) * 100
    setPos(Math.max(0, Math.min(100, raw)))
  }, [])

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      draggingRef.current = true
      e.currentTarget.setPointerCapture(e.pointerId)
      updateFromPointer(e.clientX)
    },
    [updateFromPointer],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return
      updateFromPointer(e.clientX)
    },
    [updateFromPointer],
  )

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
  }, [])

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') setPos((p) => Math.max(0, p - 4))
    else if (e.key === 'ArrowRight') setPos((p) => Math.min(100, p + 4))
    else if (e.key === 'Home') setPos(0)
    else if (e.key === 'End') setPos(100)
  }, [])

  // RTL: clip the start side of the "before" overlay so it occupies the
  // visually-start half (physical right in RTL, physical left in LTR).
  // The pointer-derived `pos` is always physical-left-anchored, so we flip
  // the clip-path direction for RTL.
  const beforeClipPath = isRtl
    ? `inset(0 0 0 ${100 - pos}%)`
    : `inset(0 ${100 - pos}% 0 0)`

  return (
    <figure className="flex flex-col gap-3">
      <div
        ref={containerRef}
        role="slider"
        aria-label={caption}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pos)}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={onKeyDown}
        className={cn(
          'relative w-full select-none overflow-hidden rounded-2xl shadow-medium ring-1 ring-line cursor-ew-resize touch-none',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2',
          ASPECT_CLASS[aspect],
        )}
      >
        {/* Base layer — "after" image always fully visible underneath */}
        <Image
          src={afterSrc}
          alt={afterAlt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover"
          draggable={false}
        />

        {/* Overlay — "before" image, clipped from the end side */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ clipPath: beforeClipPath, WebkitClipPath: beforeClipPath }}
        >
          <Image
            src={beforeSrc}
            alt={beforeAlt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover"
            draggable={false}
          />
        </div>

        {/* Labels */}
        <span
          className="pointer-events-none absolute top-3 inline-flex items-center rounded-full bg-teal-deep/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-cream-light backdrop-blur"
          style={{ insetInlineStart: '0.75rem' }}
        >
          {t('before')}
        </span>
        <span
          className="pointer-events-none absolute top-3 inline-flex items-center rounded-full bg-gold/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-teal-deep backdrop-blur"
          style={{ insetInlineEnd: '0.75rem' }}
        >
          {t('after')}
        </span>

        {/* Divider line */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-gold shadow-[0_0_12px_rgba(201,169,97,0.55)]"
          style={{ insetInlineStart: `${pos}%`, transform: 'translateX(-50%)' }}
        />

        {/* Handle */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white shadow-medium ring-2 ring-gold transition-transform hover:scale-105"
          style={{ insetInlineStart: `${pos}%`, transform: 'translate(-50%, -50%)' }}
        >
          <ArrowLeftRight className="h-5 w-5 text-teal-deep" />
        </div>
      </div>

      <figcaption className="flex flex-wrap items-baseline justify-between gap-2 px-1">
        <span className="text-sm font-semibold text-teal-deep">{caption}</span>
        <span className="text-xs text-muted-foreground">{duration}</span>
      </figcaption>
    </figure>
  )
}
