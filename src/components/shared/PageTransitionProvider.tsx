'use client'

import type { PropsWithChildren } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { usePathname } from 'next/navigation'

export function PageTransitionProvider({ children }: PropsWithChildren) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.28, ease: [0.65, 0, 0.35, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
