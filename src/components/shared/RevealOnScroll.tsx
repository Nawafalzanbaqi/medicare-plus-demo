'use client'

import { motion, type Variants } from 'motion/react'
import type { PropsWithChildren } from 'react'
import { cn } from '@/lib/utils'

type Props = PropsWithChildren<{
  delay?: number
  y?: number
  amount?: number
  className?: string
}>

const make = (y: number): Variants => ({
  hidden: { opacity: 0, y },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.65, 0, 0.35, 1] },
  },
})

export function RevealOnScroll({
  children,
  delay = 0,
  y = 24,
  amount = 0.2,
  className,
}: Props) {
  return (
    <motion.div
      variants={make(y)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount }}
      transition={{ delay }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}
