'use client'

import { VisualEditing } from '@sanity/visual-editing/react'

/** Client-only wrapper for Sanity's <VisualEditing> overlay. */
export function VisualEditingProvider() {
  return <VisualEditing portal={false} />
}
