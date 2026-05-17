'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  text: string
  className?: string
  /** Stagger per word in seconds. */
  stagger?: number
  /** Duration of each word's reveal in seconds. */
  duration?: number
}

/**
 * Word-level reveal with GSAP + ScrollTrigger. Word splitting is bidi-safe
 * (Arabic shaping/ligatures are preserved within each word). Honors
 * prefers-reduced-motion.
 */
export function SplitText({ text, className, stagger = 0.06, duration = 0.55 }: Props) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof window === 'undefined') return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    let scrollTrigger: { kill: () => void } | undefined

    ;(async () => {
      const { gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      const words = el.querySelectorAll('[data-split-word]')

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        },
      })
      tl.from(words, {
        yPercent: 60,
        opacity: 0,
        duration,
        stagger,
        ease: 'power3.out',
      })

      scrollTrigger = tl.scrollTrigger
    })()

    return () => {
      scrollTrigger?.kill()
    }
  }, [text, stagger, duration])

  // Split on whitespace, preserving spaces as separators
  const parts = text.split(/(\s+)/)

  return (
    <span ref={ref} className={cn('inline-block', className)}>
      {parts.map((part, i) => {
        if (/^\s+$/.test(part)) {
          return (
            <span key={i} className="inline-block" aria-hidden="true">
              {' '}
            </span>
          )
        }
        return (
          <span
            key={i}
            data-split-word
            className="inline-block will-change-transform"
          >
            {part}
          </span>
        )
      })}
    </span>
  )
}
