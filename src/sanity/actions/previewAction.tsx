import { type DocumentActionComponent } from 'sanity'
import { EyeOpenIcon } from '@sanity/icons'

const siteUrl =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SITE_URL) ||
  'http://localhost:3000'

/**
 * "معاينة" — opens the live preview URL for the current document
 * in a new tab. The URL is resolved per-type using the same mapping
 * the Presentation Tool uses.
 */
export const previewAction: DocumentActionComponent = (props) => {
  const previewUrl = resolvePreviewUrl(props)
  return {
    label: 'معاينة',
    icon: EyeOpenIcon,
    disabled: !previewUrl,
    onHandle: () => {
      if (!previewUrl) return
      if (typeof window !== 'undefined') {
        window.open(previewUrl, '_blank', 'noopener,noreferrer')
      }
      props.onComplete()
    },
  }
}

function resolvePreviewUrl(props: {
  type: string
  draft: unknown
  published: unknown
}): string | null {
  const doc = (props.draft ?? props.published) as Record<string, unknown> | null

  const path = (() => {
    switch (props.type) {
      case 'homePage':
      case 'siteSettings':
      case 'topBar':
      case 'footer':
      case 'testimonial':
        return '/ar'
      case 'department': {
        const slug = (doc?.slug as { current?: string } | undefined)?.current
        return slug ? `/ar/departments/${slug}` : null
      }
      case 'article': {
        const slug =
          (doc?.slug as
            | {
                ar?: { current?: string }
                en?: { current?: string }
              }
            | undefined)?.ar?.current ||
          (doc?.slug as
            | {
                ar?: { current?: string }
                en?: { current?: string }
              }
            | undefined)?.en?.current
        return slug ? `/ar/blog/${slug}` : '/ar/blog'
      }
      case 'offer':
        return '/ar/offers'
      case 'doctor':
        return '/ar/doctors'
      case 'insurance':
        return '/ar/insurance'
      default:
        return null
    }
  })()

  return path ? `${siteUrl}${path}` : null
}
