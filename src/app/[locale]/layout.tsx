import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { VisualEditingProvider } from '@/components/shared/VisualEditingProvider'
import {
  El_Messiri,
  IBM_Plex_Sans_Arabic,
  Cormorant_Garamond,
  IBM_Plex_Sans,
} from 'next/font/google'
import { Toaster } from 'sonner'
import { routing } from '@/i18n/routing'
import { TopBar } from '@/components/layout/TopBar'
import { Navbar } from '@/components/layout/Navbar'
import { TrustBar } from '@/components/layout/TrustBar'
import { Footer } from '@/components/layout/Footer'
import { WhatsAppFloat } from '@/components/layout/WhatsAppFloat'
import { QuickBookingBar } from '@/components/booking/QuickBookingBar'
import { JsonLd } from '@/components/shared/JsonLd'
import { PageTransitionProvider } from '@/components/shared/PageTransitionProvider'
import { SmoothScrollProvider } from '@/components/shared/SmoothScrollProvider'
import { CONTACT } from '@/lib/constants'
import { SITE_URL, canonicalUrl, languageAlternates } from '@/lib/seo'

const displayAr = El_Messiri({
  subsets: ['arabic'],
  weight: ['500', '600', '700'],
  variable: '--font-display-ar',
  display: 'swap',
})

const bodyAr = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body-ar',
  display: 'swap',
})

const displayEn = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display-en',
  display: 'swap',
})

const bodyEn = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body-en',
  display: 'swap',
})

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}

  const t = await getTranslations({ locale })
  const brandName = t('nav.brandName')
  const description = t('footer.description')

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: brandName,
      template: `%s | ${brandName}`,
    },
    description,
    applicationName: brandName,
    keywords: [
      'MediCare',
      'مركز ميديكير بلس الطبي',
      'Riyadh',
      'medical complex',
      'cosmetic',
      'audiology',
      'surgery',
    ],
    authors: [{ name: brandName }],
    alternates: {
      canonical: canonicalUrl(locale, '/'),
      languages: languageAlternates('/'),
    },
    openGraph: {
      type: 'website',
      url: canonicalUrl(locale, '/'),
      title: brandName,
      description,
      siteName: brandName,
      locale: locale === 'ar' ? 'ar_SA' : 'en_US',
      alternateLocale: locale === 'ar' ? ['en_US'] : ['ar_SA'],
    },
    twitter: {
      card: 'summary_large_image',
      title: brandName,
      description,
    },
    robots: { index: true, follow: true },
    formatDetection: { telephone: true, address: true, email: true },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const t = await getTranslations({ locale })
  const { isEnabled: isDraftMode } = await draftMode()

  const dir = locale === 'ar' ? 'rtl' : 'ltr'
  const fontVariables = `${displayAr.variable} ${bodyAr.variable} ${displayEn.variable} ${bodyEn.variable}`

  const medicalBusinessJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    '@id': `${SITE_URL}/${locale}#business`,
    name: t('nav.brandName'),
    description: t('footer.description'),
    inLanguage: locale,
    url: canonicalUrl(locale, '/'),
    telephone: CONTACT.phone,
    email: CONTACT.email,
    foundingDate: '2010',
    address: {
      '@type': 'PostalAddress',
      streetAddress: t('footer.address'),
      addressLocality: 'Riyadh',
      addressRegion: 'Makkah',
      addressCountry: 'SA',
    },
    sameAs: [
      `https://instagram.com/${CONTACT.social.instagram.replace('@', '')}`,
      `https://snapchat.com/add/${CONTACT.social.snapchat}`,
    ],
    medicalSpecialty: [
      'Cosmetic',
      'Surgery',
      'Audiology',
      'Dentistry',
      'InternalMedicine',
      'Pediatrics',
      'Gynecology',
      'Orthopedic',
      'Ophthalmology',
      'Laboratory',
      'Radiology',
    ],
  }

  return (
    <html lang={locale} dir={dir} className={`${fontVariables} antialiased`}>
      <body className="flex min-h-screen flex-col bg-cream-light text-ink">
        <JsonLd data={medicalBusinessJsonLd} />
        <NextIntlClientProvider>
          <SmoothScrollProvider>
            <TopBar />
            <Navbar />
            <TrustBar />
            <main className="flex-1">
              <PageTransitionProvider>{children}</PageTransitionProvider>
            </main>
            <Footer />
            <WhatsAppFloat />
            <QuickBookingBar />
            <Toaster
              position={locale === 'ar' ? 'bottom-left' : 'bottom-right'}
              richColors
            />
          </SmoothScrollProvider>
        </NextIntlClientProvider>
        {isDraftMode && <VisualEditingProvider />}
      </body>
    </html>
  )
}
