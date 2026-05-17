'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/utils'

type Props = {
  phrases: string[]
  intervalMs?: number
  className?: string
}

export function RotatingTagline({
  phrases,
  intervalMs = 3000,
  className,
}: Props) {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (phrases.length <= 1) return
    const id = window.setInterval(() => {
      setIdx((i) => (i + 1) % phrases.length)
    }, intervalMs)
    return () => window.clearInterval(id)
  }, [phrases.length, intervalMs])

  return (
    <div
      className={cn('relative inline-flex justify-center', className)}
      aria-live="polite"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={idx}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.45, ease: [0.65, 0, 0.35, 1] }}
          className="inline-block"
        >
          {phrases[idx]}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}
