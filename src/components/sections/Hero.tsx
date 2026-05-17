'use client'

import { motion, type Variants } from 'motion/react'
import { useLocale, useTranslations } from 'next-intl'
import { ArrowRight, Stethoscope } from 'lucide-react'
import { SparkleIcon, StarIcon } from '@phosphor-icons/react/dist/ssr'
import { createDataAttribute } from '@sanity/visual-editing/create-data-attribute'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { AnimatedNumber } from '@/components/shared/AnimatedNumber'
import { MagneticButton } from '@/components/shared/MagneticButton'
import { RichTitle } from '@/components/shared/RichTitle'
import { SafeImage } from '@/components/shared/SafeImage'
import { cn } from '@/lib/utils'
import { getWhatsAppUrl, type WhatsAppPage } from '@/lib/whatsapp'
import { urlForImage } from '@/sanity/lib/image'
import { dataset, projectId } from '@/sanity/env'
import type {
  ButtonValue,
  CardValue,
  HeroSection,
  Locale,
  StatItemValue,
} from '@/sanity/types'

const DIAMOND_PATTERN =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><path d="M20 0 L40 20 L20 40 L0 20 Z" fill="none" stroke="%23c9a961" stroke-opacity="0.4" stroke-width="1"/></svg>',
  )

type Props = { data?: HeroSection }

export function Hero({ data }: Props) {
  const t = useTranslations('hero')
  const tCommon = useTranslations('common')
  const locale = useLocale() as Locale
  const isRtl = locale === 'ar'
  const xFrom = isRtl ? 30 : -30

  // ---------------- value resolution (Sanity → translation fallback)
  const badge = data?.badge?.[locale] || t('badge')

  // Visual-edit data attributes — only emitted when Sanity is configured.
  const heroAttr = (path: string) =>
    projectId
      ? createDataAttribute({
          projectId,
          dataset,
          baseUrl: '/studio',
          id: 'homePage',
          type: 'homePage',
          path,
        }).toString()
      : undefined
  const description = data?.description?.[locale] || t('description')
  const heroImageSrc = urlForImage(data?.heroImage)?.width(1600).url() ?? null

  // ---------------- background
  const bgStyle = data?.backgroundStyle ?? 'cream-gradient'
  const customBgUrl =
    bgStyle === 'custom' && data?.customBackground
      ? urlForImage(data.customBackground)?.width(2000).url() || null
      : null

  // ---------------- stats: 5 defaults; CMS overrides whole array
  const stats: StatItemValue[] =
    data?.stats && data.stats.length > 0
      ? data.stats
      : [
          { value: 35, suffix: '+', label: { ar: t('stats.years'), en: t('stats.years') } },
          { value: 12, label: { ar: t('stats.departments'), en: t('stats.departments') } },
          { value: 50, suffix: '+', label: { ar: t('stats.doctors'), en: t('stats.doctors') } },
          { value: 4.2, decimals: 1, label: { ar: t('stats.rating'), en: t('stats.rating') } },
          { value: 10000, prefix: '+', label: { ar: t('patientsCard.label'), en: t('patientsCard.label') } },
        ]

  // ---------------- floating cards: CMS overrides; fallback uses the 2 default cards
  const floatingCards: CardValue[] | null =
    data?.floatingCards && data.floatingCards.length > 0
      ? data.floatingCards.slice(0, 2)
      : null

  const textContainer: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  }
  const textItem: Variants = {
    hidden: { opacity: 0, x: xFrom },
    show: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: [0.65, 0, 0.35, 1] },
    },
  }
  const cardEntrance = (delay: number): Variants => ({
    hidden: { opacity: 0, y: 30, scale: 0.96 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.7, delay, ease: [0.65, 0, 0.35, 1] },
    },
  })

  // ---------------- button helpers
  const renderPrimaryCTA = () => {
    const cta = data?.primaryCTA
    const label = cta?.label?.[locale] || tCommon('bookNow')
    const href = cta
      ? buildButtonHref(cta, locale, 'home')
      : getWhatsAppUrl({ locale, page: 'home' })
    const opensWhatsapp = cta?.opensInWhatsApp ?? true
    return (
      <MagneticButton>
        <Button
          render={
            <a
              href={href}
              {...(opensWhatsapp || cta?.openInNewTab
                ? { target: '_blank', rel: 'noopener noreferrer' }
                : {})}
            />
          }
          nativeButton={false}
          size="lg"
          className="h-12 rounded-lg bg-teal-deep px-6 text-base text-cream-light shadow-medium hover:bg-teal"
        >
          {label}
          <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" aria-hidden="true" />
        </Button>
      </MagneticButton>
    )
  }

  const renderSecondaryCTA = () => {
    const cta = data?.secondaryCTA
    const label = cta?.label?.[locale] || tCommon('browseDepartments')
    const href = cta ? buildButtonHref(cta, locale, 'home') : '/departments'
    // Internal link → use next-intl Link; external → plain anchor.
    const isInternal = href.startsWith('/')
    return (
      <Button
        render={
          isInternal ? (
            <Link href={href} />
          ) : (
            <a href={href} target="_blank" rel="noopener noreferrer" />
          )
        }
        nativeButton={false}
        variant="outline"
        size="lg"
        className="h-12 rounded-lg border-teal-deep/25 px-6 text-base text-teal-deep hover:bg-cream hover:text-teal-deep"
      >
        <Stethoscope className="me-2 h-4 w-4" aria-hidden="true" />
        {label}
      </Button>
    )
  }

  return (
    <section className={cn('relative overflow-hidden', BG_CLASS[bgStyle] ?? 'bg-cream-light')}>
      {/* Custom-image background */}
      {customBgUrl && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `url("${customBgUrl}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.5,
          }}
        />
      )}

      {/* Atmospheric radials */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 100% 0%, rgba(201,169,97,0.04) 0%, rgba(247,242,232,0) 65%), radial-gradient(ellipse 60% 50% at 0% 100%, rgba(13,62,62,0.03) 0%, rgba(247,242,232,0) 70%)',
        }}
      />
      {/* Diamond pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("${DIAMOND_PATTERN}")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="container relative mx-auto grid gap-12 px-4 py-20 sm:py-24 xl:grid-cols-5 xl:gap-12 xl:py-28">
        {/* TEXT COLUMN */}
        <motion.div
          variants={textContainer}
          initial="hidden"
          animate="show"
          className="mx-auto flex max-w-3xl flex-col gap-7 text-center xl:mx-0 xl:col-span-3 xl:max-w-none xl:text-start"
        >
          <motion.div variants={textItem} className="flex justify-center xl:justify-start">
            <span
              className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-cream px-4 py-1.5 text-xs font-medium text-teal-deep"
              data-sanity={heroAttr(`hero.badge.${locale}`)}
            >
              <span className="relative grid h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
              </span>
              {badge}
            </span>
          </motion.div>

          <motion.h1
            variants={textItem}
            className="font-semibold leading-[1.15] text-teal-deep text-[clamp(2.2rem,4.5vw,3.6rem)]"
          >
            {data?.title ? (
              <RichTitle
                value={data.title}
                locale={locale}
                fallback={t.rich('title', { em: emFallback })}
              />
            ) : (
              t.rich('title', { em: emFallback })
            )}
          </motion.h1>

          <motion.p
            variants={textItem}
            className="max-w-2xl text-lg leading-relaxed text-muted-foreground mx-auto xl:mx-0"
            data-sanity={heroAttr(`hero.description.${locale}`)}
          >
            {description}
          </motion.p>

          <motion.div
            variants={textItem}
            className="flex flex-wrap items-center justify-center gap-3 xl:justify-start"
          >
            {renderPrimaryCTA()}
            {renderSecondaryCTA()}
          </motion.div>

          <motion.dl
            variants={textItem}
            className="mt-4 grid grid-cols-2 gap-x-5 gap-y-5 border-t border-line pt-6 sm:grid-cols-3 xl:grid-cols-5"
          >
            {stats.map((s, i) =>
              s ? (
                <Stat
                  key={i}
                  value={s.value}
                  decimals={s.decimals ?? undefined}
                  prefix={s.prefix ?? undefined}
                  suffix={s.suffix ?? undefined}
                  label={s.label?.[locale] ?? ''}
                />
              ) : null,
            )}
          </motion.dl>
        </motion.div>

        {/* VISUAL COLUMN */}
        <div className="hidden md:flex md:flex-col md:gap-4 xl:relative xl:col-span-2 xl:block xl:h-[560px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.65, 0, 0.35, 1] }}
            className="relative h-[320px] w-full overflow-hidden rounded-3xl shadow-strong md:h-[360px] xl:h-full"
          >
            <SafeImage
              src={heroImageSrc}
              alt={data?.heroImage?.alt || t('floatingCard.title')}
              priority
              sizes="(max-width: 768px) 0px, (max-width: 1280px) 100vw, 40vw"
              aspect="auto"
              wrapperClassName="absolute inset-0 h-full w-full rounded-3xl"
              rounded={false}
              locale={locale}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, rgba(13,62,62,0) 55%, rgba(13,62,62,0.25) 100%)',
              }}
            />
          </motion.div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:contents">
            {/* Main floating card */}
            {floatingCards?.[0] ? (
              <FloatingCard
                card={floatingCards[0]}
                locale={locale}
                kind="main"
                cardEntrance={cardEntrance}
                delay={0.2}
              />
            ) : (
              <DefaultMainCard cardEntrance={cardEntrance} t={t} />
            )}

            {/* Secondary floating card (testimonial-style by default) */}
            {floatingCards?.[1] ? (
              <FloatingCard
                card={floatingCards[1]}
                locale={locale}
                kind="secondary"
                cardEntrance={cardEntrance}
                delay={0.4}
              />
            ) : (
              <DefaultTestimonialCard cardEntrance={cardEntrance} t={t} />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

const BG_CLASS: Record<string, string> = {
  'cream-gradient': 'bg-cream-light',
  'teal-subtle': 'bg-teal-deep/5',
  'solid-cream': 'bg-cream',
  custom: 'bg-cream-light',
}

function emFallback(chunks: React.ReactNode) {
  return (
    <span className="relative inline-block not-italic text-gold">
      <span className="relative z-10">{chunks}</span>
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-[0.1em] -z-0 h-[0.25em] rounded-sm bg-gold/20"
      />
    </span>
  )
}

function buildButtonHref(cta: ButtonValue, locale: Locale, defaultPage: WhatsAppPage) {
  if (!cta) return '/'
  if (cta.opensInWhatsApp) {
    const page = (cta.whatsappContext as WhatsAppPage | undefined) ?? defaultPage
    return getWhatsAppUrl({ locale, page })
  }
  return cta.url || '/'
}

/* ----------------------------------------------------------- Floating cards */

function FloatingCard({
  card,
  locale,
  kind,
  cardEntrance,
  delay,
}: {
  card: NonNullable<CardValue>
  locale: Locale
  kind: 'main' | 'secondary'
  cardEntrance: (d: number) => Variants
  delay: number
}) {
  const title = card.title?.[locale] || ''
  const description = card.description?.[locale] || ''
  const badge = card.badge?.[locale] || ''
  const bgImageUrl = urlForImage(card.image)?.width(900).url() || null

  const classNames =
    kind === 'main'
      ? 'z-30 flex w-full flex-col rounded-2xl p-6 shadow-strong xl:absolute xl:w-[300px] xl:-rotate-2 xl:bottom-8 xl:start-[-1rem]'
      : 'z-20 w-full rounded-2xl p-5 shadow-medium backdrop-blur-sm xl:absolute xl:w-[260px] xl:rotate-3 xl:top-8 xl:end-[-1rem]'

  const style: React.CSSProperties = {}
  if (card.backgroundColor) style.backgroundColor = card.backgroundColor
  else if (kind === 'main') style.backgroundColor = '#0d3e3e'
  else style.backgroundColor = 'rgba(255,255,255,0.95)'
  if (card.textColor) style.color = card.textColor

  return (
    <motion.div
      layout
      variants={cardEntrance(delay)}
      initial="hidden"
      animate="show"
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className={classNames}
      style={style}
    >
      {bgImageUrl && (
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 overflow-hidden rounded-2xl opacity-15"
          style={{
            backgroundImage: `url("${bgImageUrl}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}
      {card.icon && (
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/15">
          <SparkleIcon size={28} weight="duotone" className="text-gold" />
        </div>
      )}
      {title && (
        <h3 className="mt-4 text-base font-semibold leading-snug sm:text-lg">
          {title}
        </h3>
      )}
      {description && (
        <p className="mt-2 text-sm leading-relaxed opacity-80">{description}</p>
      )}
      {badge && (
        <span className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold">
          {badge}
        </span>
      )}
    </motion.div>
  )
}

function DefaultMainCard({
  cardEntrance,
  t,
}: {
  cardEntrance: (d: number) => Variants
  t: ReturnType<typeof useTranslations>
}) {
  return (
    <motion.div
      layout
      variants={cardEntrance(0.2)}
      initial="hidden"
      animate="show"
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="z-30 flex w-full flex-col rounded-2xl bg-teal-deep p-6 text-cream-light shadow-strong xl:absolute xl:w-[300px] xl:-rotate-2 xl:bottom-8 xl:start-[-1rem]"
    >
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/10">
        <SparkleIcon size={28} weight="duotone" className="text-gold" />
      </div>
      <h3 className="mt-4 text-base font-semibold leading-snug text-cream-light sm:text-lg">
        {t('floatingCard.title')}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-cream-light/75">
        {t('floatingCard.description')}
      </p>
      <span className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold">
        {t('floatingCard.tag')}
      </span>
    </motion.div>
  )
}

function DefaultTestimonialCard({
  cardEntrance,
  t,
}: {
  cardEntrance: (d: number) => Variants
  t: ReturnType<typeof useTranslations>
}) {
  return (
    <motion.div
      layout
      variants={cardEntrance(0.4)}
      initial="hidden"
      animate="show"
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="z-20 w-full rounded-2xl bg-white/95 p-5 shadow-medium backdrop-blur-sm xl:absolute xl:w-[260px] xl:rotate-3 xl:top-8 xl:end-[-1rem]"
    >
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-cream font-semibold text-teal-deep">
          {t('testimonialCard.name').charAt(0)}
        </div>
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-sm font-semibold text-ink">
            {t('testimonialCard.name')}
          </span>
          <div
            className="mt-0.5 flex items-center gap-0.5"
            role="img"
            aria-label={t('testimonialCard.ariaRating')}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon key={i} size={12} weight="fill" className="text-gold" />
            ))}
          </div>
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink/80">
        {t('testimonialCard.comment')}
      </p>
    </motion.div>
  )
}

/* ----------------------------------------------------------- Stat */

type StatProps = {
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  label: string
}

function Stat({ value, decimals, prefix, suffix, label }: StatProps) {
  return (
    <div
      className={cn('flex flex-col items-center text-center xl:items-start xl:text-start')}
    >
      <span className="font-semibold text-2xl text-teal-deep sm:text-3xl xl:text-4xl">
        {prefix}
        <AnimatedNumber value={value} decimals={decimals} suffix={suffix} />
      </span>
      <span className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  )
}
