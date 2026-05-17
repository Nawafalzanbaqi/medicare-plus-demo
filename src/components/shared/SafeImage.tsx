import Image, { type ImageProps } from 'next/image'
import { ImageIcon } from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/utils'

type Aspect = 'square' | 'video' | '4/3' | '16/10' | '3/4' | 'auto'

const ASPECT_CLASS: Record<Aspect, string> = {
  square: 'aspect-square',
  video: 'aspect-video',
  '4/3': 'aspect-[4/3]',
  '16/10': 'aspect-[16/10]',
  '3/4': 'aspect-[3/4]',
  auto: '',
}

type Props = Omit<ImageProps, 'src' | 'alt'> & {
  src: string | null | undefined
  alt: string
  /** Wrapper className — applied to both the image and the placeholder. */
  wrapperClassName?: string
  /** Aspect ratio for the wrapper. Set to 'auto' to inherit from parent. */
  aspect?: Aspect
  /** Locale for the "image coming soon" placeholder label. */
  locale?: 'ar' | 'en'
  /** Whether to render the rounded corners on the placeholder. Default true. */
  rounded?: boolean
}

const PLACEHOLDER_LABEL = {
  ar: 'صورة قريباً',
  en: 'Image coming soon',
}

/**
 * Renders a Sanity-CDN image when present, otherwise a branded placeholder
 * (teal gradient + gold image icon + localized "image coming soon" text).
 *
 * Use this anywhere CMS-managed imagery may be empty so the layout never
 * breaks and the missing image is obviously a placeholder, not a broken link.
 */
export function SafeImage({
  src,
  alt,
  wrapperClassName,
  aspect = 'auto',
  locale = 'ar',
  rounded = true,
  className,
  fill = true,
  sizes,
  ...rest
}: Props) {
  const hasImage = typeof src === 'string' && src.length > 0
  const aspectClass = ASPECT_CLASS[aspect]
  const roundedClass = rounded ? 'rounded-2xl' : ''

  if (!hasImage) {
    return (
      <div
        className={cn(
          'relative isolate flex w-full items-center justify-center overflow-hidden',
          aspectClass,
          roundedClass,
          wrapperClassName,
        )}
        style={{
          background:
            'linear-gradient(135deg, var(--color-teal-deep) 0%, var(--color-teal-light) 100%)',
        }}
        aria-label={alt}
        role="img"
      >
        <div className="flex flex-col items-center gap-2 px-4 text-center">
          <ImageIcon
            size={36}
            weight="duotone"
            className="text-gold"
            aria-hidden="true"
          />
          <span className="text-xs font-medium uppercase tracking-wider text-cream-light/80">
            {PLACEHOLDER_LABEL[locale]}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        aspectClass,
        roundedClass,
        wrapperClassName,
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill={fill}
        sizes={sizes}
        className={cn('object-cover', className)}
        {...rest}
      />
    </div>
  )
}
