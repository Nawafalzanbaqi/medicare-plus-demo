'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { animate, useInView, useMotionValue } from 'motion/react'
import { useLocale } from 'next-intl'
import { cn } from '@/lib/utils'

type Props = {
  from: number
  to: number
  duration?: number
  className?: string
  style?: CSSProperties
}

export function YearCounter({
  from,
  to,
  duration = 3.5,
  className,
  style,
}: Props) {
  const locale = useLocale()
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  const motionValue = useMotionValue(from)
  const [display, setDisplay] = useState(from)

  useEffect(() => {
    if (!inView) return

    // Optional: enable a subtle tick on each year increment.
    // const tick = new Audio('/sounds/tick.mp3')
    // tick.volume = 0.15

    let lastYear = from
    const controls = animate(motionValue, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        const year = Math.round(latest)
        if (year !== lastYear) {
          lastYear = year
          setDisplay(year)
          // tick.currentTime = 0; void tick.play().catch(() => {})
        }
      },
    })
    return () => controls.stop()
  }, [inView, from, to, duration, motionValue])

  // Render with no thousands separator — years should read as "1990", not "1,990".
  const formatted = new Intl.NumberFormat(locale, { useGrouping: false }).format(
    display,
  )

  return (
    <span ref={ref} className={cn('tabular-nums', className)} style={style}>
      {formatted}
    </span>
  )
}
