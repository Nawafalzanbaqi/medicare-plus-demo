import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Check } from 'lucide-react'
import { WhatsappLogoIcon } from '@phosphor-icons/react/dist/ssr'
import { routing } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { JsonLd } from '@/components/shared/JsonLd'
import { BookingCTA } from '@/components/sections/BookingCTA'
import { RevealOnScroll } from '@/components/shared/RevealOnScroll'
import { canonicalUrl, languageAlternates, SITE_URL } from '@/lib/seo'
import { CONTACT } from '@/lib/constants'
import { getWhatsAppUrl } from '@/lib/whatsapp'
import { getSiteSettings } from '@/sanity/lib/queries'

type Params = { locale: string }

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}

  const t = await getTranslations({ locale })
  const path = '/about'
  return {
    title: t('about.title'),
    description: t('about.subtitle'),
    alternates: {
      canonical: canonicalUrl(locale, path),
      languages: languageAlternates(path),
    },
    openGraph: {
      type: 'website',
      url: canonicalUrl(locale, path),
      title: `${t('about.title')} | ${t('nav.brandName')}`,
      description: t('about.subtitle'),
      siteName: t('nav.brandName'),
      locale: locale === 'ar' ? 'ar_SA' : 'en_US',
    },
  }
}

export default async function AboutPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const t = await getTranslations({ locale })
  const loc = locale as 'ar' | 'en'
  const settings = await getSiteSettings()
  const values = t.raw('about.values') as { title: string; description: string }[]
  const whatsappHref = getWhatsAppUrl({ locale: loc, page: 'about' })
  const yearEstablished = settings?.yearEstablished ?? 2010

  const aboutJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${canonicalUrl(locale, '/about')}#about`,
    name: t('about.title'),
    description: t('about.subtitle'),
    inLanguage: locale,
    isPartOf: { '@id': `${SITE_URL}/${locale}#business` },
  }

  return (
    <>
      <JsonLd data={aboutJsonLd} />

      <section className="relative overflow-hidden bg-cream-light pt-16 pb-12 sm:pt-20 sm:pb-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(201,169,97,0.10) 0%, transparent 60%)',
          }}
        />
        <div className="container relative mx-auto max-w-3xl px-4 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
            {t('nav.about')}
          </span>
          <h1 className="mt-3 font-semibold leading-[1.1] text-teal-deep text-[clamp(2rem,4.2vw,3.4rem)]">
            {t('about.title')}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t('about.subtitle')}
          </p>
        </div>
      </section>

      <RevealOnScroll>
        <section className="bg-cream-light pb-16 sm:pb-20">
          <div className="container mx-auto max-w-3xl px-4">
            <h2 className="font-semibold leading-[1.2] text-teal-deep text-[clamp(1.5rem,2.6vw,2rem)]">
              {t('about.story.heading')}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t('about.story.body')}
            </p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-gold/15 px-4 py-1.5 text-sm font-medium text-teal-deep">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
              {loc === 'ar'
                ? `تأسس عام ${yearEstablished}`
                : `Established ${yearEstablished}`}
            </p>
          </div>
        </section>
      </RevealOnScroll>

      <RevealOnScroll>
        <section className="bg-cream py-16 sm:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <h2 className="font-semibold leading-[1.2] text-teal-deep text-[clamp(1.5rem,2.6vw,2rem)]">
                {t('about.valuesHeading')}
              </h2>
            </div>
            <ul className="grid gap-6 sm:gap-7 sm:grid-cols-3">
              {values.map((v, i) => (
                <li
                  key={i}
                  className="flex flex-col rounded-2xl border border-line bg-white p-6 shadow-soft"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold/15 ring-1 ring-gold/30">
                    <Check className="h-5 w-5 text-gold" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-teal-deep">
                    {v.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {v.description}
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-10 flex justify-center">
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
                className="h-12 rounded-lg bg-teal-deep px-6 text-base text-cream-light shadow-medium hover:bg-teal"
              >
                <WhatsappLogoIcon size={18} weight="fill" className="me-2" />
                {t('about.cta')}
              </Button>
            </div>
            <p className="mt-6 text-center text-xs text-muted-foreground">
              <a
                href={`tel:${CONTACT.phone}`}
                dir="ltr"
                className="hover:text-teal-deep"
              >
                {CONTACT.phone}
              </a>
            </p>
          </div>
        </section>
      </RevealOnScroll>

      <RevealOnScroll>
        <BookingCTA />
      </RevealOnScroll>
    </>
  )
}
