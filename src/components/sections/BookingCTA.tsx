'use client'

import { motion } from 'motion/react'
import { Phone } from 'lucide-react'
import { WhatsappLogoIcon } from '@phosphor-icons/react/dist/ssr'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { CONTACT } from '@/lib/constants'
import { getWhatsAppUrl } from '@/lib/whatsapp'
import { RichTitle } from '@/components/shared/RichTitle'
import { urlForImage } from '@/sanity/lib/image'
import type { BookingCTASection, Locale } from '@/sanity/types'

type Props = { data?: BookingCTASection }

export function BookingCTA({ data }: Props) {
  const t = useTranslations('bookingCta')
  const tCommon = useTranslations('common')
  const locale = useLocale() as Locale

  const eyebrow = data?.eyebrow?.[locale] || t('eyebrow')
  const description = data?.description?.[locale] || t('description')

  const whatsappLabel =
    data?.whatsappButton?.label?.[locale] || tCommon('whatsapp')
  const phoneLabel = data?.phoneButton?.label?.[locale] || tCommon('callUs')

  const whatsappHref =
    data?.whatsappButton?.url ||
    getWhatsAppUrl({
      type: 'booking',
      locale,
    })

  const phoneHref =
    data?.phoneButton?.url || `tel:${CONTACT.phone}`

  const bgColor = data?.backgroundColor
  const bgImageUrl = urlForImage(data?.backgroundImage)?.width(2000).url() || null

  return (
    <section
      className="relative overflow-hidden bg-teal-deep py-20 text-cream-light sm:py-24 lg:py-28"
      style={bgColor ? { backgroundColor: bgColor } : undefined}
    >
      {bgImageUrl && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `url("${bgImageUrl}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.35,
          }}
        />
      )}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(201,169,97,0.18) 0%, transparent 60%)',
        }}
      />

      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
            {eyebrow}
          </span>
          <h2 className="mt-4 font-semibold leading-[1.15] text-cream-light text-[clamp(2rem,4vw,3rem)]">
            {data?.title ? (
              <RichTitle
                value={data.title}
                locale={locale}
                fallback={t.rich('title', {
                  em: (chunks) => emFallback(chunks),
                })}
              />
            ) : (
              t.rich('title', { em: (chunks) => emFallback(chunks) })
            )}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-cream-light/75 sm:text-lg">
            {description}
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                render={
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
                nativeButton={false}
                size="lg"
                className="h-12 rounded-lg bg-gold px-6 text-base font-semibold text-teal-deep shadow-medium hover:bg-gold-soft hover:shadow-gold-glow"
              >
                <WhatsappLogoIcon size={20} weight="fill" className="me-2" />
                {whatsappLabel}
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                render={<a href={phoneHref} />}
                nativeButton={false}
                variant="outline"
                size="lg"
                className="h-12 rounded-lg border-cream-light/40 bg-transparent px-6 text-base font-semibold text-cream-light hover:border-gold hover:bg-cream-light/10 hover:text-gold"
              >
                <Phone className="me-2 h-4 w-4" aria-hidden="true" />
                {phoneLabel}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

function emFallback(chunks: React.ReactNode) {
  return (
    <span className="relative inline-block not-italic text-gold">
      <span className="relative z-10">{chunks}</span>
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-[0.1em] -z-0 h-[0.25em] rounded-sm bg-gold/25"
      />
    </span>
  )
}
