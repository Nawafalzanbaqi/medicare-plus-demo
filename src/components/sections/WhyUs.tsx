import { Check } from 'lucide-react'
import { StarIcon, TrophyIcon } from '@phosphor-icons/react/dist/ssr'
import { useLocale, useTranslations } from 'next-intl'
import { RotatingTagline } from '@/components/shared/RotatingTagline'
import { SplitText } from '@/components/shared/SplitText'
import { YearCounter } from '@/components/shared/YearCounter'
import { HeritageTimeline } from './HeritageTimeline'
import type { Locale, WhyUsSection } from '@/sanity/types'

type FeatureKey = 'experience' | 'staff' | 'equipment' | 'experience2'
const FEATURES: FeatureKey[] = ['experience', 'staff', 'equipment', 'experience2']

const DEFAULT_HERITAGE_FROM = 2010
const HERITAGE_TO = 2026

const DOT_PATTERN =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="2" cy="2" r="1" fill="%23ffffff" fill-opacity="0.5"/></svg>',
  )

type Props = { data?: WhyUsSection }

export function WhyUs({ data }: Props) {
  const t = useTranslations('whyUs')
  const locale = useLocale() as Locale
  const taglines = t.raw('heritage.taglines') as string[]
  const displayFont =
    locale === 'ar'
      ? 'var(--font-display-ar), serif'
      : 'var(--font-display-en), serif'

  const eyebrow = data?.eyebrow?.[locale] || t('eyebrow')
  const title = data?.title?.[locale] || t('title')
  const description = data?.description?.[locale] || t('description')
  const showCounter = data?.showCounter !== false
  const heritageFrom = data?.counterStartYear ?? DEFAULT_HERITAGE_FROM

  return (
    <section className="bg-cream-light py-20 sm:py-24 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-12 lg:grid-cols-5 lg:gap-14">
          {/* Text col (40%) */}
          <div className="lg:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
              {eyebrow}
            </span>
            <h2 className="mt-3 font-semibold leading-[1.2] text-teal-deep text-[clamp(1.8rem,3.2vw,2.4rem)]">
              <SplitText text={title} />
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              {description}
            </p>

            <ul className="mt-8 space-y-5">
              {FEATURES.map((key) => (
                <li key={key} className="flex items-start gap-4">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gold/15 ring-1 ring-gold/30">
                    <Check className="h-4 w-4 text-gold" aria-hidden="true" />
                  </span>
                  <div>
                    <h4 className="text-base font-semibold text-teal-deep">
                      {t(`features.${key}.title`)}
                    </h4>
                    <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                      {t(`features.${key}.description`)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Visual col (60%) — heritage panel */}
          <div className="relative lg:col-span-3">
            <div
              className="relative overflow-hidden rounded-[20px] px-6 py-12 sm:px-10 sm:py-14"
              style={{
                background:
                  'linear-gradient(135deg, var(--color-teal-deep) 0%, var(--color-teal) 60%, var(--color-teal-light) 100%)',
              }}
            >
              {/* Dot pattern */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-25"
                style={{
                  backgroundImage: `url("${DOT_PATTERN}")`,
                  backgroundRepeat: 'repeat',
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Heritage content stack */}
              <div className="relative flex flex-col items-center text-center">
                {/* Year counter */}
                {showCounter && (
                  <YearCounter
                    from={heritageFrom}
                    to={HERITAGE_TO}
                    className="bg-clip-text font-bold leading-none text-transparent"
                    style={{
                      fontFamily: displayFont,
                      fontSize: 'clamp(4rem, 10vw, 8rem)',
                      backgroundImage:
                        'linear-gradient(180deg, var(--color-gold) 0%, var(--color-gold-soft) 100%)',
                      WebkitBackgroundClip: 'text',
                    }}
                  />
                )}

                {/* Rotating tagline */}
                <RotatingTagline
                  phrases={taglines}
                  className="mt-4 text-base font-medium text-cream-light/90 sm:text-lg"
                />

                {/* Horizontal timeline */}
                <div className="mt-10 w-full sm:mt-12">
                  <HeritageTimeline />
                </div>
              </div>
            </div>

            {/* Floating badge — rating (bottom-start, outside) */}
            <div
              className="absolute z-10 flex items-center gap-3 rounded-2xl bg-white p-3.5 pe-5 shadow-medium ring-1 ring-line"
              style={{ bottom: '-1.5rem', insetInlineStart: '-1rem' }}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold/15">
                <StarIcon size={22} weight="fill" className="text-gold" />
              </span>
              <span className="text-sm font-semibold text-teal-deep">
                {t('badges.rating')}
              </span>
            </div>

            {/* Floating badge — certified (top-end, outside) */}
            <div
              className="absolute z-10 flex items-center gap-3 rounded-2xl bg-white p-3.5 pe-5 shadow-medium ring-1 ring-line"
              style={{ top: '-1.5rem', insetInlineEnd: '-1rem' }}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-deep/10">
                <TrophyIcon size={22} weight="duotone" className="text-teal-deep" />
              </span>
              <span className="text-sm font-semibold text-teal-deep">
                {t('badges.certified')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
