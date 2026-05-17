import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ChevronRight, Phone } from 'lucide-react'
import { WhatsappLogoIcon } from '@phosphor-icons/react/dist/ssr'
import { routing } from '@/i18n/routing'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { SafeImage } from '@/components/shared/SafeImage'
import { RevealOnScroll } from '@/components/shared/RevealOnScroll'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { PortableArticleBody } from '@/components/blog/PortableArticleBody'
import { JsonLd } from '@/components/shared/JsonLd'
import { AnimatedNumber } from '@/components/shared/AnimatedNumber'
import { CONTACT } from '@/lib/constants'
import { canonicalUrl, languageAlternates, SITE_URL } from '@/lib/seo'
import { getAllDoctorSlugs, getDoctorBySlug } from '@/sanity/lib/queries'
import { urlForImage } from '@/sanity/lib/image'
import { getWhatsAppUrl } from '@/lib/whatsapp'
import type { Locale } from '@/sanity/types'

type Params = { locale: string; slug: string }

export async function generateStaticParams() {
  const slugs = await getAllDoctorSlugs()
  if (!slugs || slugs.length === 0) return []
  return slugs.filter((s): s is string => !!s).map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale)) return {}

  const t = await getTranslations({ locale })
  const loc = locale as Locale
  const doctor = await getDoctorBySlug(slug)
  if (!doctor) return {}

  const titlePrefix = doctor.titlePrefix?.[loc] || (loc === 'ar' ? 'د.' : 'Dr.')
  const name = doctor.name?.[loc] || doctor.name?.[loc === 'ar' ? 'en' : 'ar'] || ''
  const fullName = `${titlePrefix} ${name}`.trim()
  const specialty = doctor.specialty?.[loc] || ''

  const path = `/doctors/${slug}`
  const url = canonicalUrl(locale, path)

  return {
    title: fullName,
    description: specialty,
    alternates: {
      canonical: url,
      languages: languageAlternates(path),
    },
    openGraph: {
      type: 'profile',
      url,
      title: `${fullName} | ${t('nav.brandName')}`,
      description: specialty,
      siteName: t('nav.brandName'),
      locale: locale === 'ar' ? 'ar_SA' : 'en_US',
    },
  }
}

export default async function DoctorDetailPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const doctor = await getDoctorBySlug(slug)
  if (!doctor) notFound()

  const t = await getTranslations({ locale })
  const loc = locale as Locale

  const titlePrefix = doctor.titlePrefix?.[loc] || (loc === 'ar' ? 'د.' : 'Dr.')
  const name = doctor.name?.[loc] || doctor.name?.[loc === 'ar' ? 'en' : 'ar'] || ''
  const fullName = `${titlePrefix} ${name}`.trim()
  const specialty = doctor.specialty?.[loc] || ''
  const photoUrl = urlForImage(doctor.photo)?.width(800).url() ?? null
  const departmentName =
    doctor.department?.name?.[loc] ||
    doctor.department?.name?.[loc === 'ar' ? 'en' : 'ar'] ||
    ''
  const departmentSlug = doctor.department?.slug?.current ?? null
  const accentColor = doctor.department?.accentColor || undefined

  const bio =
    doctor.bio?.[loc] ?? doctor.bio?.[loc === 'ar' ? 'en' : 'ar'] ?? null

  const qualifications = (doctor.qualifications ?? [])
    .map((q) => q?.[loc] || q?.[loc === 'ar' ? 'en' : 'ar'])
    .filter((v): v is string => !!v)

  const workingDaysRaw = doctor.workingDays ?? []
  const workingDaysOrder = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  const workingDays = workingDaysOrder.filter((d) => workingDaysRaw.includes(d))
  const workingHours =
    doctor.workingHours?.[loc] ||
    doctor.workingHours?.[loc === 'ar' ? 'en' : 'ar'] ||
    null

  const whatsappHref = getWhatsAppUrl({
    type: 'doctor-inquiry',
    locale: loc,
    doctor: { name: fullName, specialty },
    department:
      departmentName
        ? { slug: departmentSlug ?? undefined, name: departmentName }
        : null,
  })

  const url = canonicalUrl(locale, `/doctors/${slug}`)
  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    '@id': `${url}#person`,
    name: fullName,
    medicalSpecialty: specialty || undefined,
    inLanguage: locale,
    url,
    image: photoUrl,
    worksFor: { '@id': `${SITE_URL}/${locale}#business` },
  }

  return (
    <>
      <JsonLd data={personJsonLd} />

      {/* ============================ HERO ============================ */}
      <section className="relative overflow-hidden bg-cream-light">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 100% 0%, rgba(201,169,97,0.08) 0%, transparent 60%)',
          }}
        />
        <div className="container relative mx-auto grid gap-10 px-4 pt-10 pb-16 sm:pt-12 lg:grid-cols-5 lg:gap-12 lg:pt-14 lg:pb-20">
          {/* Text col */}
          <div className="flex flex-col gap-5 lg:col-span-3">
            <nav
              aria-label="breadcrumb"
              className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
            >
              <Link href="/" className="transition-colors hover:text-teal-deep">
                {t('doctorDetail.breadcrumbHome')}
              </Link>
              <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
              <Link
                href="/doctors"
                className="transition-colors hover:text-teal-deep"
              >
                {t('doctorDetail.breadcrumbDoctors')}
              </Link>
              <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
              <span className="line-clamp-1 text-teal-deep">{fullName}</span>
            </nav>

            {departmentName && (
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-gold/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-teal-deep ring-1 ring-gold/30">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-gold" />
                {t('doctorDetail.departmentLabel')}: {departmentName}
              </span>
            )}

            <h1 className="font-semibold leading-[1.1] text-teal-deep text-[clamp(2rem,4.2vw,3.2rem)]">
              {fullName}
            </h1>

            {specialty && (
              <p className="text-base font-medium text-gold sm:text-lg">
                {specialty}
              </p>
            )}

            <div className="mt-1 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-baseline gap-2 rounded-xl border border-line bg-white px-4 py-2.5">
                <AnimatedNumber
                  value={doctor.yearsExperience ?? 0}
                  className="text-2xl font-bold text-teal-deep tabular-nums"
                />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t('doctorDetail.experienceLabel')}
                </span>
              </span>
              {doctor.languages && doctor.languages.length > 0 && (
                <span className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-teal-deep">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t('doctorDetail.languagesLabel')}:
                  </span>
                  <span className="font-medium" dir="ltr">
                    {doctor.languages.map((l) => l.toUpperCase()).join(' · ')}
                  </span>
                </span>
              )}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-3">
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
                {t('doctorDetail.bookButton')}
              </Button>
              <Button
                render={<a href={`tel:${CONTACT.phone}`} />}
                nativeButton={false}
                variant="outline"
                size="lg"
                className="h-12 rounded-lg border-teal-deep/25 px-6 text-base text-teal-deep hover:bg-cream hover:text-teal-deep"
              >
                <Phone className="me-2 h-4 w-4" aria-hidden="true" />
                {t('doctorDetail.callButton')}
              </Button>
            </div>
          </div>

          {/* Photo col */}
          <div
            className="relative h-[320px] overflow-hidden rounded-3xl shadow-strong sm:h-[400px] lg:col-span-2 lg:h-[500px]"
            style={accentColor ? { boxShadow: `0 0 0 2px ${accentColor}55` } : undefined}
          >
            <SafeImage
              src={photoUrl}
              alt={fullName}
              priority
              sizes="(max-width: 1024px) 100vw, 40vw"
              aspect="auto"
              wrapperClassName="absolute inset-0 h-full w-full rounded-3xl"
              rounded={false}
              locale={loc}
            />
          </div>
        </div>
      </section>

      {/* ============================ BIO ============================ */}
      {bio && (
        <RevealOnScroll>
          <section className="bg-cream py-16 sm:py-20">
            <div className="container mx-auto max-w-3xl px-4">
              <SectionHeader title={t('doctorDetail.bioHeading')} />
              <div className="prose-article">
                <PortableArticleBody blocks={bio} />
              </div>
            </div>
          </section>
        </RevealOnScroll>
      )}

      {/* ============================ QUALIFICATIONS + SCHEDULE ============================ */}
      {(qualifications.length > 0 || workingDays.length > 0 || workingHours) && (
        <RevealOnScroll>
          <section className="bg-cream-light py-16 sm:py-20">
            <div className="container mx-auto px-4">
              <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 md:gap-8">
                {qualifications.length > 0 && (
                  <div className="rounded-2xl border border-line bg-white p-7 shadow-soft">
                    <h3 className="mb-4 font-semibold text-teal-deep text-[1.25rem]">
                      {t('doctorDetail.qualificationsLabel')}
                    </h3>
                    <ul className="space-y-3">
                      {qualifications.map((q, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span
                            aria-hidden="true"
                            className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gold"
                          />
                          <span className="text-sm leading-relaxed text-ink/85">
                            {q}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(workingDays.length > 0 || workingHours) && (
                  <div className="rounded-2xl border border-line bg-white p-7 shadow-soft">
                    <h3 className="mb-4 font-semibold text-teal-deep text-[1.25rem]">
                      {t('doctorDetail.scheduleLabel')}
                    </h3>
                    {workingDays.length > 0 && (
                      <ul className="flex flex-wrap gap-2">
                        {workingDays.map((d) => (
                          <li
                            key={d}
                            className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-teal-deep ring-1 ring-gold/30"
                          >
                            {t(`doctorDetail.days.${d}`)}
                          </li>
                        ))}
                      </ul>
                    )}
                    {workingHours && (
                      <p className="mt-4 text-sm text-teal-deep">
                        <span className="me-1.5 font-semibold">
                          {t('doctorDetail.workingHoursLabel')}:
                        </span>
                        <span className="text-muted-foreground">{workingHours}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        </RevealOnScroll>
      )}

      {/* ============================ CTA ============================ */}
      <RevealOnScroll>
        <section className="relative overflow-hidden bg-teal-deep py-20 text-cream-light sm:py-24">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(201,169,97,0.18) 0%, transparent 60%)',
            }}
          />
          <div className="container relative mx-auto max-w-2xl px-4 text-center">
            <h2 className="font-semibold leading-[1.2] text-cream-light text-[clamp(1.6rem,2.8vw,2.2rem)]">
              {t('services.cta.title')}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-cream-light/75">
              {t('services.cta.description')}
            </p>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex h-12 items-center gap-2 rounded-lg bg-gold px-6 text-sm font-semibold text-teal-deep shadow-medium transition-all hover:bg-gold-soft hover:shadow-gold-glow"
            >
              <WhatsappLogoIcon size={18} weight="fill" aria-hidden="true" />
              {t('doctorDetail.bookButton')}
            </a>
          </div>
        </section>
      </RevealOnScroll>
    </>
  )
}
