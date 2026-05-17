'use client'

import { useEffect, useRef, useState } from 'react'
import { animate, useInView, useMotionValue } from 'motion/react'
import { useLocale } from 'next-intl'
import { cn } from '@/lib/utils'

type Props = {
  value: number
  decimals?: number
  duration?: number
  suffix?: string
  className?: string
}

function format(n: number, locale: string, decimals: number) {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n)
}

export function AnimatedNumber({
  value,
  decimals = 0,
  duration = 1.6,
  suffix = '',
  className,
}: Props) {
  const locale = useLocale()
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const motionValue = useMotionValue(0)
  const [display, setDisplay] = useState(format(0, locale, decimals))

  useEffect(() => {
    if (!inView) return
    const controls = animate(motionValue, value, {
      duration,
      ease: [0.65, 0, 0.35, 1],
      onUpdate: (latest) => setDisplay(format(latest, locale, decimals)),
    })
    return () => controls.stop()
  }, [inView, value, duration, decimals, locale, motionValue])

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {display}
      {suffix}
    </span>
  )
}
