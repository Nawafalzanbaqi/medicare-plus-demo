import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { canonicalUrl, languageAlternates } from '@/lib/seo'
import { InsuranceCalculator } from '@/components/insurance/InsuranceCalculator'
import { getActiveInsurance } from '@/sanity/lib/queries'

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
    title: t('insurance.title'),
    description: t('insurance.subtitle'),
    alternates: {
      canonical: canonicalUrl(locale, '/insurance'),
      languages: languageAlternates('/insurance'),
    },
    openGraph: {
      type: 'website',
      url: canonicalUrl(locale, '/insurance'),
      title: `${t('insurance.title')} | ${t('nav.brandName')}`,
      description: t('insurance.subtitle'),
      siteName: t('nav.brandName'),
      locale: locale === 'ar' ? 'ar_SA' : 'en_US',
    },
  }
}

export default async function InsurancePage({
  params,
}: {
  params: Promise<Params>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const t = await getTranslations({ locale })
  const providers = (await getActiveInsurance()) ?? []

  return (
    <>
      <section className="bg-cream-light pt-12 pb-6 sm:pt-14">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
            {t('nav.insurance')}
          </span>
          <h1 className="mt-3 font-semibold leading-[1.15] text-teal-deep text-[clamp(1.9rem,3.8vw,2.8rem)]">
            {t('insurance.title')}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {t('insurance.subtitle')}
          </p>
        </div>
      </section>

      <section className="bg-cream-light pb-20 pt-6 sm:pb-24">
        <div className="container mx-auto px-4">
          <InsuranceCalculator providers={providers} />
        </div>
      </section>
    </>
  )
}
