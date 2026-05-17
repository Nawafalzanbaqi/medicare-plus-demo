'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'

const Lottie = dynamic(() => import('lottie-react'), { ssr: false })

type Props = {
  lottiePath?: string
  fallbackIcon: React.ReactNode
  className?: string
  loop?: boolean
  autoplay?: boolean
}

export function LottieIcon({
  lottiePath,
  fallbackIcon,
  className,
  loop = true,
  autoplay = true,
}: Props) {
  const [loaded, setLoaded] = useState<{ path: string; data: unknown } | null>(
    null,
  )

  useEffect(() => {
    if (!lottiePath) return

    let cancelled = false

    ;(async () => {
      try {
        const res = await fetch(lottiePath)
        if (!res.ok) return
        const json = await res.json()
        if (!cancelled) setLoaded({ path: lottiePath, data: json })
      } catch {
        // Network or parse error — silently fall back to the icon.
      }
    })()

    return () => {
      cancelled = true
    }
  }, [lottiePath])

  const data = loaded && loaded.path === lottiePath ? loaded.data : null

  if (!lottiePath || data === null) {
    return <span className={cn('inline-flex', className)}>{fallbackIcon}</span>
  }

  return (
    <Lottie
      animationData={data}
      loop={loop}
      autoplay={autoplay}
      className={className}
    />
  )
}
