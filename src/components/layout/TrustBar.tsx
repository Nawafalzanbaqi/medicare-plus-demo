import {
  StarIcon,
  CertificateIcon,
  CreditCardIcon,
  PhoneIcon,
  TrophyIcon,
  ClockIcon,
  HeartbeatIcon,
  ShieldCheckIcon,
  HospitalIcon,
  UserCheckIcon,
  CalendarCheckIcon,
} from '@phosphor-icons/react/dist/ssr'
import { getLocale, getTranslations } from 'next-intl/server'
import type { Locale } from '@/sanity/types'
import { getTrustBar } from '@/sanity/lib/queries'

type PhosphorIcon = typeof StarIcon

// Map kebab-case icon names → Phosphor duotone icons used in the trust bar.
const ICON_MAP: Record<string, PhosphorIcon> = {
  star: StarIcon,
  certificate: CertificateIcon,
  'credit-card': CreditCardIcon,
  phone: PhoneIcon,
  trophy: TrophyIcon,
  clock: ClockIcon,
  heartbeat: HeartbeatIcon,
  'shield-check': ShieldCheckIcon,
  hospital: HospitalIcon,
  'user-check': UserCheckIcon,
  'calendar-check': CalendarCheckIcon,
}

type DefaultItem = {
  iconKey: keyof typeof ICON_MAP
  translationKey: 'rating' | 'certified' | 'insurance' | 'hours' | 'experience'
}

const DEFAULT_ITEMS: DefaultItem[] = [
  { iconKey: 'star', translationKey: 'rating' },
  { iconKey: 'hospital', translationKey: 'certified' },
  { iconKey: 'credit-card', translationKey: 'insurance' },
  { iconKey: 'phone', translationKey: 'hours' },
  { iconKey: 'trophy', translationKey: 'experience' },
]

export async function TrustBar() {
  const [locale, data, t] = await Promise.all([
    getLocale() as Promise<Locale>,
    getTrustBar(),
    getTranslations('trustBar'),
  ])

  // Hidden when CMS singleton explicitly toggles it off.
  if (data?.isVisible === false) return null

  const cmsItems = data?.items?.filter((i) => i.text?.[locale]) ?? []

  const items =
    cmsItems.length > 0
      ? cmsItems.map((it, idx) => {
          const Icon = (it.icon && ICON_MAP[it.icon]) || StarIcon
          return {
            key: it._key ?? `cms-${idx}`,
            Icon,
            text: it.text![locale],
            link: it.link || null,
          }
        })
      : DEFAULT_ITEMS.map((it, idx) => ({
          key: `default-${idx}`,
          Icon: ICON_MAP[it.iconKey] ?? StarIcon,
          text: t(`defaults.${it.translationKey}`),
          link: null as string | null,
        }))

  if (items.length === 0) return null

  const style: React.CSSProperties = {
    backgroundColor: data?.backgroundColor ?? undefined,
    color: data?.textColor ?? undefined,
  }

  return (
    <div
      className="hidden border-y border-line bg-cream text-ink md:block"
      role="region"
      aria-label={t('ariaLabel')}
      style={style}
    >
      <div className="container mx-auto flex h-9 items-center justify-center gap-2 px-6 text-xs sm:gap-3">
        {items.map((item, i) => {
          const Icon = item.Icon
          const content = (
            <span className="inline-flex items-center gap-2 whitespace-nowrap">
              <Icon
                weight="duotone"
                className="h-4 w-4 text-gold"
                aria-hidden="true"
              />
              <span className="font-medium">{item.text}</span>
            </span>
          )
          return (
            <span key={item.key} className="inline-flex items-center gap-2 sm:gap-3">
              {item.link ? (
                <a
                  href={item.link}
                  className="rounded-sm transition-colors hover:text-teal-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
                >
                  {content}
                </a>
              ) : (
                content
              )}
              {i < items.length - 1 && (
                <span
                  aria-hidden="true"
                  className="inline-block h-1 w-1 rounded-full bg-gold"
                />
              )}
            </span>
          )
        })}
      </div>
    </div>
  )
}
