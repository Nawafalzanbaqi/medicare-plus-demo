'use client'

import { motion } from 'motion/react'
import { useLocale, useTranslations } from 'next-intl'

const MILESTONE_YEARS = [2010, 2014, 2018, 2022, 2026] as const

export function HeritageTimeline() {
  const t = useTranslations('whyUs.heritage.milestones')
  const locale = useLocale()

  const formatYear = (n: number) =>
    new Intl.NumberFormat(locale, { useGrouping: false }).format(n)

  return (
    <div className="relative w-full">
      {/* Horizontal connector line — desktop only (mobile scroll would offset it) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[8%] hidden h-px bg-cream-light/15 md:block"
        style={{ top: '2.4rem' }}
      />

      <ol className="flex gap-6 overflow-x-auto pb-3 snap-x snap-mandatory md:gap-2 md:overflow-visible md:justify-between [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {MILESTONE_YEARS.map((year, i) => (
          <motion.li
            key={year}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{
              delay: i * 0.2,
              duration: 0.5,
              ease: [0.65, 0, 0.35, 1],
            }}
            className="relative flex min-w-[6.5rem] shrink-0 snap-center flex-col items-center text-center md:min-w-0 md:flex-1"
          >
            <span className="text-sm font-semibold text-gold tabular-nums">
              {formatYear(year)}
            </span>
            <span
              aria-hidden="true"
              className="my-3 grid h-3 w-3 shrink-0 place-items-center rounded-full bg-gold shadow-[0_0_0_4px_var(--color-teal-deep)]"
            />
            <span className="max-w-[10rem] text-xs leading-snug text-cream-light/80">
              {t(`${year}`)}
            </span>
          </motion.li>
        ))}
      </ol>
    </div>
  )
}
