import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { WhatsappLogoIcon } from '@phosphor-icons/react/dist/ssr'
import { routing } from '@/i18n/routing'
import { JsonLd } from '@/components/shared/JsonLd'
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
  const path = '/contact'
  return {
    title: t('contact.title'),
    description: t('contact.subtitle'),
    alternates: {
      canonical: canonicalUrl(locale, path),
      languages: languageAlternates(path),
    },
    openGraph: {
      type: 'website',
      url: canonicalUrl(locale, path),
      title: `${t('contact.title')} | ${t('nav.brandName')}`,
      description: t('contact.subtitle'),
      siteName: t('nav.brandName'),
      locale: locale === 'ar' ? 'ar_SA' : 'en_US',
    },
  }
}

export default async function ContactPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const t = await getTranslations({ locale })
  const tTop = await getTranslations({ locale, namespace: 'topBar' })
  const loc = locale as 'ar' | 'en'

  const settings = await getSiteSettings()
  const phone = settings?.phone ?? CONTACT.phone
  const email = settings?.email ?? CONTACT.email
  const address = settings?.address?.[loc] ?? CONTACT.address[loc]
  const hours = settings?.workingHours?.[loc] ?? tTop('hours')
  const whatsappHref = getWhatsAppUrl({ locale: loc, page: 'contact' })

  const contactJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': `${canonicalUrl(locale, '/contact')}#contact`,
    name: t('contact.title'),
    inLanguage: locale,
    isPartOf: { '@id': `${SITE_URL}/${locale}#business` },
  }

  return (
    <>
      <JsonLd data={contactJsonLd} />

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
            {t('nav.contact')}
          </span>
          <h1 className="mt-3 font-semibold leading-[1.1] text-teal-deep text-[clamp(2rem,4.2vw,3.4rem)]">
            {t('contact.title')}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t('contact.subtitle')}
          </p>
        </div>
      </section>

      <section className="bg-cream-light pb-20 sm:pb-24">
        <div className="container mx-auto max-w-5xl px-4">
          <ul className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ContactCard
              icon={<WhatsappLogoIcon size={22} weight="fill" className="text-gold" />}
              title={t('contact.channels.whatsappTitle')}
              description={t('contact.channels.whatsappDescription')}
              actionLabel={CONTACT.whatsapp}
              actionHref={whatsappHref}
              external
            />
            <ContactCard
              icon={<Phone className="h-5 w-5 text-gold" aria-hidden="true" />}
              title={t('contact.channels.phoneTitle')}
              description={t('contact.channels.phoneDescription')}
              actionLabel={phone}
              actionHref={`tel:${phone}`}
            />
            <ContactCard
              icon={<Mail className="h-5 w-5 text-gold" aria-hidden="true" />}
              title={t('contact.channels.emailTitle')}
              description={t('contact.channels.emailDescription')}
              actionLabel={email}
              actionHref={`mailto:${email}`}
            />
            <ContactCard
              icon={<MapPin className="h-5 w-5 text-gold" aria-hidden="true" />}
              title={t('contact.channels.addressTitle')}
              description={t('contact.channels.addressDescription')}
              actionLabel={address}
            />
            <ContactCard
              icon={<Clock className="h-5 w-5 text-gold" aria-hidden="true" />}
              title={t('contact.channels.hoursTitle')}
              description={hours}
            />
          </ul>

          <div className="mt-10 flex justify-center">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-lg bg-gold px-6 text-sm font-semibold text-teal-deep shadow-medium transition-all hover:bg-gold-soft hover:shadow-gold-glow"
            >
              <WhatsappLogoIcon size={18} weight="fill" aria-hidden="true" />
              {t('contact.cta')}
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

type CardProps = {
  icon: React.ReactNode
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  external?: boolean
}

function ContactCard({ icon, title, description, actionLabel, actionHref, external }: CardProps) {
  return (
    <li className="flex flex-col rounded-2xl border border-line bg-white p-6 shadow-soft">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold/15 ring-1 ring-gold/30">
        {icon}
      </span>
      <h3 className="mt-4 text-lg font-semibold text-teal-deep">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {actionLabel && actionHref ? (
        <a
          href={actionHref}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          dir="ltr"
          className="mt-4 inline-flex items-center text-sm font-semibold text-teal-deep transition-colors hover:text-gold"
        >
          {actionLabel}
        </a>
      ) : actionLabel ? (
        <p className="mt-4 text-sm font-medium text-teal-deep">{actionLabel}</p>
      ) : null}
    </li>
  )
}
