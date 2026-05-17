import { ArrowRight } from 'lucide-react'
import type { Icon } from '@phosphor-icons/react'
import {
  BabyIcon,
  BoneIcon,
  EyeIcon,
  FlaskIcon,
  FlowerIcon,
  ImageIcon,
  StethoscopeIcon,
  ToothIcon,
} from '@phosphor-icons/react/dist/ssr'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { ALL_DEPARTMENTS } from '@/lib/data'

type SecondarySlug =
  | 'dental'
  | 'internal'
  | 'pediatrics'
  | 'gynecology'
  | 'orthopedics'
  | 'ophthalmology'
  | 'lab'
  | 'radiology'

const ICONS: Record<SecondarySlug, Icon> = {
  dental: ToothIcon,
  internal: StethoscopeIcon,
  pediatrics: BabyIcon,
  gynecology: FlowerIcon,
  orthopedics: BoneIcon,
  ophthalmology: EyeIcon,
  lab: FlaskIcon,
  radiology: ImageIcon,
}

type Props = { data?: import('@/sanity/types').AllDepartmentsSection }

export function AllDepartments({ data }: Props) {
  const t = useTranslations('allDepartments')
  const locale = useLocale() as 'ar' | 'en'

  const eyebrow = data?.eyebrow?.[locale] || t('eyebrow')
  const title = data?.title?.[locale] || t('title')

  const secondary = ALL_DEPARTMENTS.filter(
    (d): d is typeof d & { slug: SecondarySlug } => !d.featured,
  )

  return (
    <section className="bg-cream-light py-20 sm:py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
            {eyebrow}
          </span>
          <h2 className="mt-3 font-semibold leading-[1.2] text-teal-deep text-[clamp(1.7rem,3.2vw,2.4rem)]">
            {title}
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {secondary.map((dept) => {
            const Icon = ICONS[dept.slug]
            return (
              <Link
                key={dept.slug}
                href={`/departments/${dept.slug}`}
                className="group relative flex flex-col rounded-2xl border border-line bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-soft"
              >
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-cream ring-1 ring-line transition-colors group-hover:bg-gold/10 group-hover:ring-gold/30">
                  <Icon
                    size={28}
                    weight="duotone"
                    className="text-teal-deep transition-colors group-hover:text-gold"
                  />
                </span>
                <h4 className="mt-4 text-base font-semibold text-teal-deep">
                  {t(`${dept.slug}.name`)}
                </h4>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {t(`${dept.slug}.description`)}
                </p>
                <ArrowRight
                  aria-hidden="true"
                  className="mt-4 h-4 w-4 self-start text-teal-deep/40 transition-all duration-300 group-hover:translate-x-1 group-hover:text-gold rtl:rotate-180 rtl:group-hover:-translate-x-1"
                />
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
