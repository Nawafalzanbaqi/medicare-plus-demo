'use client'

import { CalendarCheckIcon, WhatsappLogoIcon } from '@phosphor-icons/react/dist/ssr'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'soft'
type Size = 'sm' | 'md' | 'lg'

type CommonProps = {
  /** Display label (already localised by caller). */
  label: string
  variant?: Variant
  size?: Size
  /** Stop click propagation so a clickable parent card doesn't navigate. */
  stopPropagation?: boolean
  /** Optional extra classes — merged via `cn()`. */
  className?: string
  /** Hide the icon entirely. */
  hideIcon?: boolean
  /** ARIA label override. */
  ariaLabel?: string
}

type InternalProps = CommonProps & {
  href: string
  external?: false
}

type ExternalProps = CommonProps & {
  href: string
  /** Open as external link (e.g., `wa.me/...`) in a new tab. */
  external: true
}

type Props = InternalProps | ExternalProps

const SIZE_CLASS: Record<Size, string> = {
  sm: 'h-9 px-3 text-xs',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-5 text-sm sm:text-base',
}

const ICON_SIZE: Record<Size, number> = {
  sm: 14,
  md: 16,
  lg: 18,
}

const VARIANT_CLASS: Record<Variant, string> = {
  primary:
    'bg-teal-deep text-cream-light hover:bg-teal active:bg-teal-deep shadow-soft hover:shadow-medium focus-visible:ring-gold',
  soft:
    'bg-gold text-teal-deep hover:bg-gold-soft shadow-soft hover:shadow-gold-glow focus-visible:ring-teal-deep',
}

/**
 * Reusable "Book" button. Same look used by ServiceCard, DoctorCard,
 * OfferCard and Service detail page so the booking call-to-action is
 * visually consistent everywhere.
 *
 * - `external={false}` (default) → next-intl `<Link>`, internal nav.
 * - `external={true}` → plain `<a>` with `target="_blank"`, used for
 *   `wa.me/...` direct WhatsApp links. Uses the WhatsApp logo icon
 *   instead of the calendar icon.
 */
export function BookButton(props: Props) {
  const {
    href,
    label,
    variant = 'primary',
    size = 'md',
    stopPropagation = false,
    className,
    hideIcon = false,
    ariaLabel,
  } = props
  const isExternal = props.external === true

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
  ) => {
    if (stopPropagation) e.stopPropagation()
  }

  const classes = cn(
    'group/book inline-flex w-full items-center justify-center gap-2 rounded-lg font-semibold tracking-tight transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'hover:scale-[1.02] active:scale-[0.99]',
    SIZE_CLASS[size],
    VARIANT_CLASS[variant],
    className,
  )

  const iconNode = hideIcon ? null : isExternal ? (
    <WhatsappLogoIcon
      size={ICON_SIZE[size]}
      weight="fill"
      aria-hidden="true"
    />
  ) : (
    <CalendarCheckIcon
      size={ICON_SIZE[size]}
      weight="duotone"
      aria-hidden="true"
      className="transition-transform duration-300 group-hover/book:rotate-6"
    />
  )

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        aria-label={ariaLabel ?? label}
        className={classes}
      >
        {iconNode}
        <span>{label}</span>
      </a>
    )
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      aria-label={ariaLabel ?? label}
      className={classes}
    >
      {iconNode}
      <span>{label}</span>
    </Link>
  )
}
