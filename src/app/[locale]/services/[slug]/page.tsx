import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { CalendarCheck, ChevronRight, Clock, Phone } from 'lucide-react'
import { StethoscopeIcon } from '@phosphor-icons/react/dist/ssr'
import { routing } from '@/i18n/routing'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { SafeImage } from '@/components/shared/SafeImage'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { RevealOnScroll } from '@/components/shared/RevealOnScroll'
import { FAQAccordion } from '@/components/department/FAQAccordion'
import { ServiceCard } from '@/components/department/ServiceCard'
import { DoctorCard } from '@/components/department/DoctorCard'
import { PortableArticleBody } from '@/components/blog/PortableArticleBody'
import { JsonLd } from '@/components/shared/JsonLd'
import { CONTACT } from '@/lib/constants'
import { getBookingFlowUrl, getWhatsAppUrl } from '@/lib/whatsapp'
import { canonicalUrl, languageAlternates, SITE_URL } from '@/lib/seo'
import {
  ALL_DEPARTMENTS,
  type DepartmentSlug,
  type Doctor,
  type DoctorGender,
  type DoctorLanguage,
  type DoctorNationality,
} from '@/lib/data'
import {
  getAllServiceSlugs,
  getDoctorsByDepartmentId,
  getRelatedServices,
  getServiceBySlug,
} from '@/sanity/lib/queries'
import { urlForImage } from '@/sanity/lib/image'
import type { DoctorListItem, Locale } from '@/sanity/types'

type Params = { locale: string; slug: string }

export async function generateStaticParams() {
  const slugs = await getAllServiceSlugs()
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
  const service = await getServiceBySlug(slug)

  if (!service) {
    return {
      title: t('services.metaTitle'),
      description: t('services.metaDescription'),
    }
  }

  const name = service.name?.[loc] || service.name?.[loc === 'ar' ? 'en' : 'ar'] || ''
  const description =
    service.description?.[loc] ||
    service.description?.[loc === 'ar' ? 'en' : 'ar'] ||
    t('services.metaDescription')

  const path = `/services/${slug}`
  const url = canonicalUrl(locale, path)
  const imageUrl = urlForImage(service.image)?.width(1200).url() ?? null

  return {
    title: name,
    description,
    alternates: {
      canonical: url,
      languages: languageAlternates(path),
    },
    openGraph: {
      type: 'article',
      url,
      title: `${name} | ${t('nav.brandName')}`,
      description,
      siteName: t('nav.brandName'),
      images: imageUrl ? [{ url: imageUrl }] : undefined,
      locale: locale === 'ar' ? 'ar_SA' : 'en_US',
      alternateLocale: locale === 'ar' ? ['en_US'] : ['ar_SA'],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} | ${t('nav.brandName')}`,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  }
}

function mapSanityDoctorToDoctor(
  d: DoctorListItem,
  fallbackDeptSlug: DepartmentSlug,
): Doctor {
  const deptSlug =
    (d.department?.slug?.current as DepartmentSlug | undefined) ?? fallbackDeptSlug
  return {
    id: d._id,
    slug: d.slug?.current ?? null,
    name: { ar: d.name?.ar || '', en: d.name?.en || '' },
    title: {
      ar: d.titlePrefix?.ar || 'د.',
      en: d.titlePrefix?.en || 'Dr.',
    },
    specialty: { ar: d.specialty?.ar || '', en: d.specialty?.en || '' },
    yearsExperience: d.yearsExperience ?? 0,
    photo: urlForImage(d.photo)?.width(600).url() || '',
    department: deptSlug,
    gender: (d.gender ?? 'male') as DoctorGender,
    nationality: (d.nationality ?? 'sa') as DoctorNationality,
    languages: (d.languages ?? ['ar', 'en']) as DoctorLanguage[],
  }
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const service = await getServiceBySlug(slug)
  if (!service) notFound()

  const t = await getTranslations({ locale })
  const loc = locale as Locale

  const name =
    service.name?.[loc] || service.name?.[loc === 'ar' ? 'en' : 'ar'] || ''
  const description =
    service.description?.[loc] ||
    service.description?.[loc === 'ar' ? 'en' : 'ar'] ||
    ''
  const duration =
    service.duration?.[loc] || service.duration?.[loc === 'ar' ? 'en' : 'ar'] || null
  const imageUrl = urlForImage(service.image)?.width(1200).url() ?? null
  const accentColor = service.department?.accentColor || undefined

  const benefits = (service.benefits ?? [])
    .map((b) => b?.[loc] || b?.[loc === 'ar' ? 'en' : 'ar'])
    .filter((v): v is string => !!v)

  const detailedDescription =
    service.detailedDescription?.[loc] ??
    service.detailedDescription?.[loc === 'ar' ? 'en' : 'ar'] ??
    null
  const preparation =
    service.preparation?.[loc] ??
    service.preparation?.[loc === 'ar' ? 'en' : 'ar'] ??
    null
  const aftercare =
    service.aftercare?.[loc] ??
    service.aftercare?.[loc === 'ar' ? 'en' : 'ar'] ??
    null

  const faqs = (service.faqs ?? [])
    .map((f) => ({
      question: f?.question?.[loc] || '',
      answer: f?.answer?.[loc] || '',
    }))
    .filter((f) => f.question && f.answer)

  // Related doctors (in the same department)
  const relatedDoctorsRaw = service.department?._id
    ? await getDoctorsByDepartmentId(service.department._id)
    : null
  const deptSlug =
    (service.department?.slug?.current as DepartmentSlug | undefined) ?? 'cosmetic'
  const relatedDoctors: Doctor[] = (relatedDoctorsRaw ?? []).map((d) =>
    mapSanityDoctorToDoctor(d, deptSlug),
  )

  // Related services in the same department
  const relatedServicesRaw = service.department?._id
    ? await getRelatedServices(service.department._id, service._id)
    : null
  const currencyLabel = t('departments.common.currency')
  const popularLabel = t('departments.common.popular')

  const departmentName =
    service.department?.name?.[loc] ||
    service.department?.name?.[loc === 'ar' ? 'en' : 'ar'] ||
    ''
  const departmentSlug = service.department?.slug?.current ?? null
  const isKnownDept = departmentSlug
    ? ALL_DEPARTMENTS.some((d) => d.slug === departmentSlug)
    : false

  // Pre-filled booking flow URL — Step 3 is reached automatically when
  // both department + service are present.
  const bookFlowPath = getBookingFlowUrl({
    departmentSlug: departmentSlug ?? undefined,
    serviceSlug: slug,
  })

  // Inquiry-style WhatsApp link used for the empty-state fallback only.
  const whatsappHref = getWhatsAppUrl({
    type: 'inquiry',
    locale: loc,
    department: departmentName
      ? { slug: departmentSlug ?? undefined, name: departmentName }
      : null,
    service: { slug, name },
  })

  const url = canonicalUrl(locale, `/services/${slug}`)
  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    '@id': `${url}#service`,
    name,
    description,
    inLanguage: locale,
    url,
    isPartOf: { '@id': `${SITE_URL}/${locale}#business` },
    image: imageUrl,
  }

  return (
    <>
      <JsonLd data={serviceJsonLd} />

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
                {t('services.breadcrumbHome')}
              </Link>
              <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
              <Link
                href="/departments"
                className="transition-colors hover:text-teal-deep"
              >
                {t('services.breadcrumbDepartments')}
              </Link>
              {departmentSlug && isKnownDept && (
                <>
                  <ChevronRight
                    className="h-3.5 w-3.5 rtl:rotate-180"
                    aria-hidden="true"
                  />
                  <Link
                    href={`/departments/${departmentSlug}`}
                    className="transition-colors hover:text-teal-deep"
                  >
                    {departmentName}
                  </Link>
                </>
              )}
              <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
              <span className="line-clamp-1 text-teal-deep">{name}</span>
            </nav>

            {departmentName && (
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-gold/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-teal-deep ring-1 ring-gold/30">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full bg-gold"
                />
                {t('services.departmentLabel')}: {departmentName}
              </span>
            )}

            <h1 className="font-semibold leading-[1.1] text-teal-deep text-[clamp(2rem,4.2vw,3.2rem)]">
              {name}
            </h1>

            {description && (
              <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {description}
              </p>
            )}

            <div className="mt-1 flex flex-wrap items-center gap-3">
              {service.showPrice && typeof service.price === 'number' && (
                <span className="inline-flex items-baseline gap-1.5 rounded-xl border border-gold/40 bg-gold/10 px-4 py-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t('services.hero.priceLabel')}
                  </span>
                  <span className="text-xl font-bold text-teal-deep tabular-nums">
                    {service.price}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {currencyLabel}
                  </span>
                </span>
              )}
              {duration && (
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-4 py-2 text-sm text-teal-deep">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {t('services.hero.durationLabel')}:
                  </span>
                  <span className="font-medium">{duration}</span>
                </span>
              )}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <Button
                render={<Link href={bookFlowPath} />}
                nativeButton={false}
                size="lg"
                className="h-12 rounded-lg bg-teal-deep px-6 text-base text-cream-light shadow-medium hover:bg-teal"
              >
                <CalendarCheck className="me-2 h-4 w-4" aria-hidden="true" />
                {t('services.hero.bookCTA')}
              </Button>
              <Button
                render={<a href={`tel:${CONTACT.phone}`} />}
                nativeButton={false}
                variant="outline"
                size="lg"
                className="h-12 rounded-lg border-teal-deep/25 px-6 text-base text-teal-deep hover:bg-cream hover:text-teal-deep"
              >
                <Phone className="me-2 h-4 w-4" aria-hidden="true" />
                {t('services.hero.callCTA')}
              </Button>
            </div>
          </div>

          {/* Image col */}
          <div
            className="relative h-[280px] overflow-hidden rounded-3xl shadow-strong sm:h-[360px] lg:col-span-2 lg:h-[460px]"
            style={accentColor ? { boxShadow: `0 0 0 2px ${accentColor}55` } : undefined}
          >
            <SafeImage
              src={imageUrl}
              alt={name}
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

      {/* ============================ DETAILED DESCRIPTION ============================ */}
      {(detailedDescription || description) && (
        <RevealOnScroll>
          <section className="bg-cream py-16 sm:py-20">
            <div className="container mx-auto max-w-3xl px-4">
              <SectionHeader
                eyebrow={t('services.description')}
                title={name}
              />
              <div className="prose-article">
                {detailedDescription ? (
                  <PortableArticleBody blocks={detailedDescription} />
                ) : (
                  <p className="text-base leading-[1.85] text-ink/85">
                    {description}
                  </p>
                )}
              </div>
            </div>
          </section>
        </RevealOnScroll>
      )}

      {/* ============================ BENEFITS ============================ */}
      {benefits.length > 0 && (
        <RevealOnScroll>
          <section className="bg-cream-light py-16 sm:py-20">
            <div className="container mx-auto max-w-4xl px-4">
              <SectionHeader title={t('services.benefits')} />
              <ul className="grid gap-3 sm:grid-cols-2">
                {benefits.map((b, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 rounded-2xl border border-line bg-white p-5 shadow-soft"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gold"
                    />
                    <span className="text-sm leading-relaxed text-ink/85">
                      {b}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </RevealOnScroll>
      )}

      {/* ============================ PREPARATION + AFTERCARE ============================ */}
      {(preparation || aftercare) && (
        <RevealOnScroll>
          <section className="bg-cream py-16 sm:py-20">
            <div className="container mx-auto px-4">
              <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 md:gap-8">
                {preparation && (
                  <div className="rounded-2xl border border-line bg-white p-7 shadow-soft">
                    <h3 className="mb-4 font-semibold text-teal-deep text-[1.25rem]">
                      {t('services.preparation')}
                    </h3>
                    <div className="prose-article">
                      <PortableArticleBody blocks={preparation} />
                    </div>
                  </div>
                )}
                {aftercare && (
                  <div className="rounded-2xl border border-line bg-white p-7 shadow-soft">
                    <h3 className="mb-4 font-semibold text-teal-deep text-[1.25rem]">
                      {t('services.aftercare')}
                    </h3>
                    <div className="prose-article">
                      <PortableArticleBody blocks={aftercare} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </RevealOnScroll>
      )}

      {/* ============================ RELATED DOCTORS ============================ */}
      {relatedDoctors.length > 0 && (
        <RevealOnScroll>
          <section className="bg-cream-light py-20 sm:py-24">
            <div className="container mx-auto px-4">
              <SectionHeader title={t('services.relatedDoctors')} />
              <div
                className={
                  relatedDoctors.length >= 3
                    ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3'
                    : 'flex flex-wrap items-stretch justify-center gap-6'
                }
              >
                {relatedDoctors.slice(0, 6).map((doctor) => (
                  <div
                    key={doctor.id}
                    className={
                      relatedDoctors.length >= 3 ? '' : 'w-full max-w-[340px]'
                    }
                  >
                    <DoctorCard doctor={doctor} locale={loc} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </RevealOnScroll>
      )}

      {/* ============================ RELATED SERVICES ============================ */}
      {relatedServicesRaw && relatedServicesRaw.length > 0 && (
        <RevealOnScroll>
          <section className="bg-cream py-20 sm:py-24">
            <div className="container mx-auto px-4">
              <SectionHeader title={t('services.relatedServices')} />
              <div
                className={
                  relatedServicesRaw.length >= 3
                    ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7 place-items-stretch justify-items-center'
                    : 'flex flex-wrap items-stretch justify-center gap-6 sm:gap-7'
                }
              >
                {relatedServicesRaw.map((rs) => (
                  <ServiceCard
                    key={rs._id}
                    iconName={rs.icon || 'sparkle'}
                    name={
                      rs.name?.[loc] || rs.name?.[loc === 'ar' ? 'en' : 'ar'] || ''
                    }
                    description={rs.description?.[loc] || ''}
                    slug={rs.slug?.current ?? null}
                    departmentSlug={departmentSlug ?? undefined}
                    price={rs.price ?? null}
                    showPrice={rs.showPrice ?? false}
                    duration={
                      rs.duration?.[loc] ||
                      rs.duration?.[loc === 'ar' ? 'en' : 'ar'] ||
                      null
                    }
                    isPopular={rs.isPopular ?? false}
                    accentColor={accentColor}
                    currencyLabel={currencyLabel}
                    popularLabel={popularLabel}
                  />
                ))}
              </div>
            </div>
          </section>
        </RevealOnScroll>
      )}

      {/* ============================ FAQs ============================ */}
      {faqs.length > 0 ? (
        <RevealOnScroll>
          <section className="bg-cream-light py-20 sm:py-24">
            <div className="container mx-auto px-4">
              <SectionHeader title={t('services.faqs.title')} />
              <FAQAccordion items={faqs} />
            </div>
          </section>
        </RevealOnScroll>
      ) : null}

      {/* ============================ EMPTY STATE (no content at all) ============================ */}
      {!detailedDescription &&
        !description &&
        benefits.length === 0 &&
        relatedDoctors.length === 0 && (
          <RevealOnScroll>
            <section className="bg-cream-light py-16 sm:py-20">
              <div className="container mx-auto px-4">
                <EmptyState
                  icon={StethoscopeIcon}
                  title={t('departments.common.empty.servicesTitle')}
                  description={t('departments.common.empty.servicesDescription')}
                  ctaLabel={t('departments.common.empty.contactCta')}
                  ctaHref={whatsappHref}
                />
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
            <Link
              href={bookFlowPath}
              className="mt-7 inline-flex h-12 items-center gap-2 rounded-lg bg-gold px-6 text-sm font-semibold text-teal-deep shadow-medium transition-all hover:bg-gold-soft hover:shadow-gold-glow"
            >
              <CalendarCheck className="h-4 w-4" aria-hidden="true" />
              {t('services.cta.button')}
            </Link>
          </div>
        </section>
      </RevealOnScroll>
    </>
  )
}
