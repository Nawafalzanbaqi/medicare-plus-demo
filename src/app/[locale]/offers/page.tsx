import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server'
import { Calendar } from 'lucide-react'
import { routing } from '@/i18n/routing'
import { BookButton } from '@/components/shared/BookButton'
import { SafeImage } from '@/components/shared/SafeImage'
import { canonicalUrl, languageAlternates } from '@/lib/seo'
import { getWhatsAppUrl } from '@/lib/whatsapp'
import { getActiveOffers } from '@/sanity/lib/queries'
import { urlForImage } from '@/sanity/lib/image'
import type { Locale, OfferDoc } from '@/sanity/types'

type Params = { locale: string }

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const t = await getTranslations({ locale })
  return {
    title: t('offers.title'),
    description: t('offers.subtitle'),
    alternates: {
      canonical: canonicalUrl(locale, '/offers'),
      languages: languageAlternates('/offers'),
    },
    openGraph: {
      type: 'website',
      url: canonicalUrl(locale, '/offers'),
      title: `${t('offers.title')} | ${t('nav.brandName')}`,
      description: t('offers.subtitle'),
      siteName: t('nav.brandName'),
      locale: locale === 'ar' ? 'ar_SA' : 'en_US',
    },
  }
}

export default async function OffersPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const t = await getTranslations({ locale })
  const format = await getFormatter({ locale })
  const loc = locale as Locale

  const offers = (await getActiveOffers()) ?? []

  return (
    <>
      <section className="bg-cream-light pt-12 pb-8 sm:pt-14">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
            {t('nav.offers')}
          </span>
          <h1 className="mt-3 font-semibold leading-[1.15] text-teal-deep text-[clamp(1.9rem,3.8vw,2.8rem)]">
            {t('offers.title')}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {t('offers.subtitle')}
          </p>
        </div>
      </section>

      <section className="bg-cream-light pb-20 pt-6 sm:pb-24">
        <div className="container mx-auto px-4">
          {offers.length === 0 ? (
            <div className="mx-auto max-w-md rounded-2xl border border-line bg-white p-10 text-center shadow-soft">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t('offers.empty')}
              </p>
              <div className="mt-5">
                <BookButton
                  href={getWhatsAppUrl({ type: 'inquiry', locale: loc })}
                  external
                  label={t('common.whatsapp')}
                  size="md"
                  className="mx-auto max-w-xs"
                />
              </div>
            </div>
          ) : (
            <ul className="grid gap-6 sm:gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {offers.map((offer) => (
                <li key={offer._id}>
                  <OfferCard offer={offer} locale={loc} t={t} format={format} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  )
}

function OfferCard({
  offer,
  locale,
  t,
  format,
}: {
  offer: OfferDoc
  locale: Locale
  t: Awaited<ReturnType<typeof getTranslations>>
  format: Awaited<ReturnType<typeof getFormatter>>
}) {
  const title = offer.title?.[locale] || ''
  const description = offer.description?.[locale] || ''
  const badge = offer.badgeText?.[locale]
  const currency = offer.currency || 'SAR'
  const imageUrl = urlForImage(offer.image)?.width(900).url() || null

  const original = typeof offer.originalPrice === 'number' ? offer.originalPrice : null
  const price = typeof offer.offerPrice === 'number' ? offer.offerPrice : null
  const discount =
    original && price && original > price
      ? Math.round(((original - price) / original) * 100)
      : null

  const whatsappHref = getWhatsAppUrl({
    type: 'offer',
    locale,
    offer: {
      title,
      offerPrice: price,
      originalPrice: original,
      currency,
    },
  })

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:shadow-medium">
      <div className="relative">
        <SafeImage
          src={imageUrl}
          alt={title}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          aspect="16/10"
          rounded={false}
          locale={locale}
          className="transition-transform duration-500 group-hover:scale-105"
        />
        {imageUrl && (
          <>
          {discount && (
            <span
              className="absolute top-3 inline-flex items-center rounded-full bg-gold px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-teal-deep shadow-soft"
              style={{ insetInlineStart: '0.75rem' }}
            >
              {t('offers.discountLabel', { percent: discount })}
            </span>
          )}
          {badge && (
            <span
              className="absolute top-3 inline-flex items-center rounded-full bg-teal-deep/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-cream-light backdrop-blur"
              style={{ insetInlineEnd: '0.75rem' }}
            >
              {badge}
            </span>
          )}
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold leading-snug text-teal-deep">{title}</h3>
        {description && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}

        <div className="mt-4 flex items-baseline gap-3 border-t border-line pt-4">
          {price !== null && (
            <span className="text-2xl font-bold text-teal-deep tabular-nums">
              {price} <span className="text-sm font-medium text-muted-foreground">{currency}</span>
            </span>
          )}
          {original !== null && price !== null && original > price && (
            <span className="text-sm text-muted-foreground line-through tabular-nums">
              {original} {currency}
            </span>
          )}
        </div>

        <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
          {t('offers.validUntilLabel')}:{' '}
          <span className="font-medium text-teal-deep">
            {format.dateTime(new Date(offer.validUntil), { dateStyle: 'medium' })}
          </span>
        </p>

        <div className="mt-auto pt-5">
          <BookButton
            href={whatsappHref}
            external
            label={t('departments.common.bookThisOffer')}
            ariaLabel={`${t('departments.common.bookThisOffer')} — ${title}`}
            size="md"
          />
        </div>
      </div>
    </article>
  )
}
