'use client'

import { useEffect } from 'react'

export function useLenis() {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (prefersReducedMotion) return

    let rafId: number | null = null
    let lenisInstance: { raf: (time: number) => void; destroy: () => void } | null =
      null

    const run = async () => {
      const { default: Lenis } = await import('lenis')
      await import('lenis/dist/lenis.css').catch(() => {})

      lenisInstance = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 2,
      })

      const raf = (time: number) => {
        lenisInstance?.raf(time)
        rafId = requestAnimationFrame(raf)
      }
      rafId = requestAnimationFrame(raf)
    }

    void run()

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId)
      lenisInstance?.destroy()
    }
  }, [])
}
