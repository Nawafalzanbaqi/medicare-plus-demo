'use client'

import { motion, type Variants } from 'motion/react'
import { useLocale, useTranslations } from 'next-intl'
import { ArrowRight } from 'lucide-react'
import type { Icon } from '@phosphor-icons/react'
import {
  SparkleIcon,
  FirstAidIcon,
  EarIcon,
} from '@phosphor-icons/react/dist/ssr'
import { Link } from '@/i18n/navigation'
import { FEATURED_DEPARTMENTS } from '@/lib/data'
import { LottieIcon } from '@/components/shared/LottieIcon'
import { cn } from '@/lib/utils'
import type { FeaturedDepartmentsSection, Locale } from '@/sanity/types'

type DeptContent = {
  name: string
  tagline: string
  description: string
  services: string[]
}

// Flip to `true` once /public/lottie/{cosmetic,surgery,audiology}.json exist.
const LOTTIE_AVAILABLE = false

const FALLBACK_ICONS: Record<
  'cosmetic' | 'surgery' | 'audiology',
  Icon
> = {
  cosmetic: SparkleIcon,
  surgery: FirstAidIcon,
  audiology: EarIcon,
}

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      delay: i * 0.15,
      ease: [0.65, 0, 0.35, 1],
    },
  }),
}

const headingVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.65, 0, 0.35, 1] },
  },
}

type Props = { data?: FeaturedDepartmentsSection }

export function FeaturedDepartments({ data }: Props) {
  const t = useTranslations('featuredDepartments')
  const tCommon = useTranslations('common')
  const locale = useLocale() as Locale

  const eyebrow = data?.eyebrow?.[locale] || t('eyebrow')
  const title = data?.title?.[locale] || t('title')
  const description = data?.description?.[locale] || t('description')
  const showNumbers = data?.showNumbers !== false
  const bgColor = data?.backgroundColor || undefined

  return (
    <section
      id="featured-departments"
      className="relative overflow-hidden bg-teal-deep py-20 text-cream-light sm:py-24 lg:py-28"
      style={bgColor ? { backgroundColor: bgColor } : undefined}
    >
      {/* Background radials */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 0% 0%, rgba(201,169,97,0.08) 0%, transparent 60%), radial-gradient(ellipse 70% 50% at 100% 100%, rgba(201,169,97,0.08) 0%, transparent 60%)',
        }}
      />

      <div className="container relative mx-auto px-4">
        {/* Heading */}
        <motion.div
          variants={headingVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-5 inline-flex items-center gap-4">
            <span aria-hidden="true" className="h-px w-12 bg-gold/50" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
              {eyebrow}
            </span>
            <span aria-hidden="true" className="h-px w-12 bg-gold/50" />
          </div>
          <h2 className="font-semibold leading-[1.15] text-cream-light text-[clamp(1.9rem,3.6vw,2.75rem)]">
            {title}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-cream-light/70">
            {description}
          </p>
        </motion.div>

        {/* Cards */}
        <div className="mt-14 grid gap-6 sm:gap-7 md:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-7">
          {FEATURED_DEPARTMENTS.map((dept, i) => {
            const content = t.raw(dept.translationKey) as DeptContent
            const Fallback = FALLBACK_ICONS[dept.slug]
            const number = String(i + 1).padStart(2, '0')

            return (
              <motion.article
                key={dept.slug}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.2 }}
                className={cn(
                  'group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition-all duration-500',
                  'hover:-translate-y-2 hover:border-gold/60 hover:bg-gold/[0.08] hover:shadow-gold-glow',
                )}
              >
                {/* Top sliding gold bar */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-[3px] origin-[0%_50%] scale-x-0 bg-gold transition-transform duration-500 ease-out group-hover:scale-x-100 rtl:origin-[100%_50%]"
                />

                {/* Watermark number */}
                {showNumbers && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute top-4 select-none font-bold text-7xl leading-none tracking-tighter text-gold/15 tabular-nums sm:text-8xl"
                    style={{ insetInlineEnd: '1.25rem' }}
                  >
                    {number}
                  </span>
                )}

                {/* Icon */}
                <div
                  className={cn(
                    'relative grid h-16 w-16 place-items-center rounded-xl bg-gold/15 ring-1 ring-gold/25 transition-transform duration-500',
                    'group-hover:rotate-[5deg] group-hover:scale-105 group-hover:bg-gold/25',
                  )}
                >
                  <LottieIcon
                    lottiePath={LOTTIE_AVAILABLE ? dept.lottie : undefined}
                    className="h-10 w-10"
                    fallbackIcon={
                      <Fallback size={32} weight="duotone" className="text-gold" />
                    }
                  />
                </div>

                {/* Name */}
                <h3 className="relative mt-6 text-xl font-semibold leading-snug text-cream-light sm:text-2xl">
                  {content.name}
                </h3>

                {/* Tagline */}
                <p className="relative mt-2 text-sm font-medium text-gold">
                  {content.tagline}
                </p>

                {/* Description */}
                <p className="relative mt-4 text-sm leading-relaxed text-cream-light/70">
                  {content.description}
                </p>

                {/* Services */}
                <ul className="relative mt-5 space-y-2.5 text-sm text-cream-light/80">
                  {content.services.map((service) => (
                    <li key={service} className="flex items-start gap-2.5">
                      <span
                        aria-hidden="true"
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
                      />
                      <span className="leading-relaxed">{service}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  href={`/departments/${dept.slug}`}
                  className="relative mt-7 inline-flex items-center gap-2 self-start text-sm font-semibold text-gold transition-colors hover:text-cream-light"
                >
                  <span>{tCommon('exploreDepartment')}</span>
                  <ArrowRight
                    aria-hidden="true"
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                  />
                </Link>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
