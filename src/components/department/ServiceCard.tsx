'use client'

import { Clock } from 'lucide-react'
import type { Icon } from '@phosphor-icons/react'
import {
  BabyIcon,
  BoneIcon,
  CalendarCheckIcon,
  DropIcon,
  EarIcon,
  FirstAidIcon,
  HandSoapIcon,
  HeadphonesIcon,
  HeartIcon,
  LeafIcon,
  LightningIcon,
  ScissorsIcon,
  ShieldCheckIcon,
  SparkleIcon,
  SpeakerHighIcon,
  StarIcon,
  SyringeIcon,
  UserCircleIcon,
  WrenchIcon,
} from '@phosphor-icons/react/dist/ssr'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { BookButton } from '@/components/shared/BookButton'
import { getBookingFlowUrl } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'

const ICONS: Record<string, Icon> = {
  syringe: SyringeIcon,
  sparkle: SparkleIcon,
  drop: DropIcon,
  'hand-soap': HandSoapIcon,
  leaf: LeafIcon,
  lightning: LightningIcon,
  'first-aid': FirstAidIcon,
  scissors: ScissorsIcon,
  bone: BoneIcon,
  heart: HeartIcon,
  'shield-check': ShieldCheckIcon,
  'calendar-check': CalendarCheckIcon,
  ear: EarIcon,
  'speaker-high': SpeakerHighIcon,
  'user-circle': UserCircleIcon,
  baby: BabyIcon,
  wrench: WrenchIcon,
  headphones: HeadphonesIcon,
}

type Props = {
  iconName: string
  name: string
  description: string
  slug?: string | null
  /** Parent department slug — used to pre-fill the booking flow. */
  departmentSlug?: string | null
  price?: number | null
  showPrice?: boolean | null
  duration?: string | null
  isPopular?: boolean | null
  accentColor?: string | null
  currencyLabel?: string
  popularLabel?: string
}

export function ServiceCard({
  iconName,
  name,
  description,
  slug,
  departmentSlug,
  price,
  showPrice,
  duration,
  isPopular,
  accentColor,
  currencyLabel,
  popularLabel,
}: Props) {
  const t = useTranslations('departments.common')
  const Icon = ICONS[iconName] ?? SparkleIcon
  const hasLink = !!slug
  const accent = accentColor || undefined

  const bookHref = getBookingFlowUrl({
    departmentSlug: departmentSlug ?? undefined,
    serviceSlug: slug ?? undefined,
  })

  const cardClass = cn(
    'group relative flex h-full w-full max-w-[360px] flex-col rounded-2xl border border-line bg-white p-7 sm:p-8 text-start transition-all duration-300',
    'hover:-translate-y-1 hover:border-gold/60 hover:shadow-medium',
  )

  const iconBox = (
    <span
      className="grid h-14 w-14 place-items-center rounded-xl bg-gold/10 ring-1 ring-gold/20 transition-colors group-hover:bg-gold/20"
      style={
        accent
          ? { backgroundColor: `${accent}1A`, boxShadow: `inset 0 0 0 1px ${accent}33` }
          : undefined
      }
    >
      <Icon
        size={28}
        weight="duotone"
        className="text-teal-deep transition-colors group-hover:text-gold"
        style={accent ? { color: accent } : undefined}
      />
    </span>
  )

  const popularBadge = isPopular && popularLabel && (
    <span
      className="absolute top-4 z-10 inline-flex items-center gap-1 rounded-full bg-gold px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-deep shadow-soft"
      style={{ insetInlineEnd: '1rem' }}
    >
      <StarIcon size={11} weight="fill" aria-hidden="true" />
      {popularLabel}
    </span>
  )

  const meta = (
    <div className="mt-5 flex flex-wrap items-center gap-2">
      {showPrice && typeof price === 'number' && (
        <span className="inline-flex items-center rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-teal-deep ring-1 ring-gold/30">
          <span className="tabular-nums">{price}</span>
          <span className="ms-1 text-[10px] uppercase tracking-wider text-muted-foreground">
            {currencyLabel}
          </span>
        </span>
      )}
      {duration && (
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          {duration}
        </span>
      )}
    </div>
  )

  const textBlock = (
    <>
      {iconBox}
      <h3 className="mt-6 font-display-ar font-semibold text-teal-deep text-[1.4rem] leading-snug">
        {name}
      </h3>
      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {meta}
    </>
  )

  return (
    <article className={cardClass}>
      {popularBadge}

      {hasLink ? (
        <Link
          href={`/services/${slug}`}
          className="flex flex-1 flex-col rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
        >
          {textBlock}
        </Link>
      ) : (
        <div className="flex flex-1 flex-col">{textBlock}</div>
      )}

      <div className="mt-6 pt-2">
        <BookButton
          href={bookHref}
          label={t('bookThisService')}
          variant="primary"
          size="md"
          stopPropagation
          className="h-11"
          ariaLabel={`${t('bookThisService')} — ${name}`}
        />
      </div>
    </article>
  )
}
