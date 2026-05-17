'use client'

import type { PropsWithChildren } from 'react'
import { useLenis } from '@/hooks/useLenis'

export function SmoothScrollProvider({ children }: PropsWithChildren) {
  useLenis()
  return <>{children}</>
}
