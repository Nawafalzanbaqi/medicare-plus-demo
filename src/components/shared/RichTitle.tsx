import type { ReactNode } from 'react'
import type { LocalizedRichText, PortableTextBlock } from '@/sanity/types'

type Props = {
  value?: LocalizedRichText | null
  locale: 'ar' | 'en'
  /** Wraps inline `em` marks. Defaults to a gold-accent span. */
  renderEm?: (chunks: ReactNode) => ReactNode
  /** Optional fallback rendered when value is empty. */
  fallback?: ReactNode
}

const defaultEm = (chunks: ReactNode) => (
  <span className="relative inline-block not-italic text-gold">
    <span className="relative z-10">{chunks}</span>
    <span
      aria-hidden="true"
      className="absolute inset-x-0 bottom-[0.1em] -z-0 h-[0.25em] rounded-sm bg-gold/20"
    />
  </span>
)

function renderBlock(
  block: PortableTextBlock,
  key: number,
  renderEm: NonNullable<Props['renderEm']>,
): ReactNode {
  const children = (block.children ?? []).map((child, i) => {
    const isEm = (child.marks ?? []).includes('em')
    return isEm ? (
      <span key={i}>{renderEm(child.text)}</span>
    ) : (
      <span key={i}>{child.text}</span>
    )
  })
  // Preserve line breaks between blocks.
  return <span key={key}>{children}{' '}</span>
}

export function RichTitle({
  value,
  locale,
  renderEm = defaultEm,
  fallback = null,
}: Props) {
  const blocks = value?.[locale] ?? value?.[locale === 'ar' ? 'en' : 'ar'] ?? null
  if (!blocks || blocks.length === 0) return <>{fallback}</>
  return <>{blocks.map((b, i) => renderBlock(b, i, renderEm))}</>
}
