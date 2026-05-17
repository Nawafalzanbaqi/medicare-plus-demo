import {
  Clock,
  Microscope,
  ShieldCheck,
  UserCheck,
  type LucideIcon,
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import type { Locale, TrustStripSection } from '@/sanity/types'

type DefaultItem = {
  key: 'quickBooking' | 'equipment' | 'staff' | 'insurance'
  icon: LucideIcon
}

const DEFAULT_ITEMS: DefaultItem[] = [
  { key: 'quickBooking', icon: Clock },
  { key: 'equipment', icon: Microscope },
  { key: 'staff', icon: UserCheck },
  { key: 'insurance', icon: ShieldCheck },
]

// Map CMS icon names → component for the small handful supported here.
const ICON_MAP: Record<string, LucideIcon> = {
  clock: Clock,
  microscope: Microscope,
  'shield-check': ShieldCheck,
  'user-check': UserCheck,
}

type Props = { data?: TrustStripSection }

export function TrustStrip({ data }: Props) {
  const t = useTranslations('trustStrip')
  const locale = useLocale() as Locale

  // Build the items array: CMS overrides whole list when provided.
  const items =
    data?.items && data.items.length > 0
      ? data.items.map((item, i) => {
          const Icon = (item.icon && ICON_MAP[item.icon]) || DEFAULT_ITEMS[i % 4].icon
          return {
            key: `cms-${i}`,
            Icon,
            title: item.title?.[locale] || '',
            description: item.description?.[locale] || '',
          }
        })
      : DEFAULT_ITEMS.map((it) => ({
          key: it.key,
          Icon: it.icon,
          title: t(`${it.key}.title`),
          description: t(`${it.key}.description`),
        }))

  return (
    <section className="border-y border-line bg-cream">
      <div className="container mx-auto px-4 py-10 sm:py-12">
        <ul className="grid grid-cols-2 gap-y-8 sm:gap-y-10 md:grid-cols-4">
          {items.map((item, i) => {
            const Icon = item.Icon
            return (
              <li
                key={item.key}
                className={
                  i < items.length - 1
                    ? 'flex flex-col items-center px-4 text-center md:border-e md:border-line'
                    : 'flex flex-col items-center px-4 text-center'
                }
              >
                <span className="grid h-12 w-12 place-items-center rounded-full bg-teal-deep/5 text-teal-deep ring-1 ring-teal-deep/10">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h4 className="mt-3 text-base font-semibold text-teal-deep">
                  {item.title}
                </h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
