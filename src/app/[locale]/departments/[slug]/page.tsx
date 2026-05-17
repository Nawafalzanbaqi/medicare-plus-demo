import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import {
  StethoscopeIcon,
  SparkleIcon,
  ImageIcon,
  WrenchIcon,
  QuestionIcon,
} from '@phosphor-icons/react/dist/ssr'
import { routing } from '@/i18n/routing'
import {
  ALL_DEPARTMENTS,
  DOCTORS,
  type DepartmentSlug,
  type Doctor,
  type DoctorGender,
  type DoctorLanguage,
  type DoctorNationality,
  type FeaturedSlug,
} from '@/lib/data'
import { DepartmentHero } from '@/components/department/DepartmentHero'
import { ServiceCard } from '@/components/department/ServiceCard'
import { DoctorCard } from '@/components/department/DoctorCard'
import { FAQAccordion } from '@/components/department/FAQAccordion'
import { BeforeAfterGallery } from '@/components/department/BeforeAfterGallery'
import { BeforeAfterSlider } from '@/components/department/BeforeAfterSlider'
import { EquipmentShowcase } from '@/components/department/EquipmentShowcase'
import { BookingCTA } from '@/components/sections/BookingCTA'
import { RevealOnScroll } from '@/components/shared/RevealOnScroll'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { JsonLd } from '@/components/shared/JsonLd'
import { canonicalUrl, languageAlternates, SITE_URL } from '@/lib/seo'
import { getWhatsAppUrl } from '@/lib/whatsapp'
import { getAllDepartmentSlugs, getDepartmentBySlug } from '@/sanity/lib/queries'
import { urlForImage } from '@/sanity/lib/image'
import type {
  DoctorDoc,
  Locale,
  ServiceDoc,
} from '@/sanity/types'

type Params = { locale: string; slug: string }

const FEATURED_SLUGS: FeaturedSlug[] = ['cosmetic', 'surgery', 'audiology']

function isFeatured(slug: string): slug is FeaturedSlug {
  return (FEATURED_SLUGS as string[]).includes(slug)
}

function isKnownSlug(slug: string): slug is DepartmentSlug {
  return ALL_DEPARTMENTS.some((d) => d.slug === slug)
}

export async function generateStaticParams() {
  const cmsSlugs = (await getAllDepartmentSlugs()) ?? []
  const merged = new Set<string>([
    ...ALL_DEPARTMENTS.map((d) => d.slug),
    ...cmsSlugs.filter((s): s is string => !!s),
  ])
  return Array.from(merged).map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { locale, slug } = await params

  if (!hasLocale(routing.locales, locale)) return {}

  const cmsDept = await getDepartmentBySlug(slug)
  if (!cmsDept && !isKnownSlug(slug)) return {}

  const t = await getTranslations({ locale })
  const loc = locale as Locale

  const fallbackName = isKnownSlug(slug)
    ? isFeatured(slug)
      ? t(`featuredDepartments.${slug}.name`)
      : t(`allDepartments.${slug}.name`)
    : slug

  const fallbackDescription = isKnownSlug(slug)
    ? isFeatured(slug)
      ? t(`departments.${slug}.heroDescription`)
      : t(`allDepartments.${slug}.description`)
    : ''

  const name = cmsDept?.name?.[loc] || cmsDept?.name?.[loc === 'ar' ? 'en' : 'ar'] || fallbackName
  const description =
    cmsDept?.shortDescription?.[loc] ||
    cmsDept?.shortDescription?.[loc === 'ar' ? 'en' : 'ar'] ||
    fallbackDescription

  const path = `/departments/${slug}`
  const url = canonicalUrl(locale, path)

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
      locale: locale === 'ar' ? 'ar_SA' : 'en_US',
      alternateLocale: locale === 'ar' ? ['en_US'] : ['ar_SA'],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name} | ${t('nav.brandName')}`,
      description,
    },
  }
}

type ServiceItem = {
  iconName: string
  name: string
  description: string
  slug?: string | null
  price?: number | null
  showPrice?: boolean | null
  duration?: string | null
  isPopular?: boolean | null
}
type FaqItem = { question: string; answer: string }
type GalleryPair = { caption: string; before: string | null; after: string | null }
type EquipmentItem = { name: string; description: string; image: string | null }

function mapCmsService(s: ServiceDoc, locale: Locale): ServiceItem {
  return {
    iconName: s.icon || 'sparkle',
    name: s.name?.[locale] || s.name?.[locale === 'ar' ? 'en' : 'ar'] || '',
    description: s.description?.[locale] || '',
    slug: s.slug?.current ?? null,
    price: s.price ?? null,
    showPrice: s.showPrice ?? false,
    duration:
      s.duration?.[locale] || s.duration?.[locale === 'ar' ? 'en' : 'ar'] || null,
    isPopular: s.isPopular ?? false,
  }
}

function mapCmsDoctor(d: DoctorDoc, deptSlug: string): Doctor {
  const photoUrl = urlForImage(d.photo)?.width(600).url() || ''
  return {
    id: d._id,
    slug: d.slug?.current ?? null,
    name: { ar: d.name?.ar || '', en: d.name?.en || '' },
    title: {
      ar: d.titlePrefix?.ar || 'د.',
      en: d.titlePrefix?.en || 'Dr.',
    },
    specialty: {
      ar: d.specialty?.ar || '',
      en: d.specialty?.en || '',
    },
    yearsExperience: d.yearsExperience ?? 0,
    photo: photoUrl,
    department: deptSlug as DepartmentSlug,
    gender: (d.gender ?? 'male') as DoctorGender,
    nationality: (d.nationality ?? 'sa') as DoctorNationality,
    languages: (d.languages ?? ['ar', 'en']) as DoctorLanguage[],
  }
}

export default async function DepartmentPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { locale, slug } = await params

  if (!hasLocale(routing.locales, locale)) notFound()

  setRequestLocale(locale)

  const t = await getTranslations()
  const loc = locale as Locale

  // ---------- CMS overlay (returns null when Sanity isn't configured) ----------
  const cmsDept = await getDepartmentBySlug(slug)

  // Only 404 if neither CMS nor the hardcoded fallback knows this slug.
  if (!cmsDept && !isKnownSlug(slug)) notFound()

  // Resolve hero strings + image
  const fallbackName = isKnownSlug(slug)
    ? isFeatured(slug)
      ? t(`featuredDepartments.${slug}.name`)
      : t(`allDepartments.${slug}.name`)
    : slug

  const fallbackTagline = isKnownSlug(slug)
    ? isFeatured(slug)
      ? t(`featuredDepartments.${slug}.tagline`)
      : t(`allDepartments.${slug}.description`)
    : ''

  const fallbackDescription = isKnownSlug(slug)
    ? isFeatured(slug)
      ? t(`departments.${slug}.heroDescription`)
      : t(`allDepartments.${slug}.description`)
    : ''

  const name = cmsDept?.name?.[loc] || cmsDept?.name?.[loc === 'ar' ? 'en' : 'ar'] || fallbackName
  const tagline =
    cmsDept?.tagline?.[loc] || cmsDept?.tagline?.[loc === 'ar' ? 'en' : 'ar'] || fallbackTagline
  const description =
    cmsDept?.shortDescription?.[loc] ||
    cmsDept?.shortDescription?.[loc === 'ar' ? 'en' : 'ar'] ||
    fallbackDescription

  const heroImage = urlForImage(cmsDept?.heroImage)?.width(1200).url() ?? null

  const accentColor = cmsDept?.accentColor || undefined
  const highlights = (cmsDept?.highlights ?? [])
    .map((h) => h?.[loc] || h?.[loc === 'ar' ? 'en' : 'ar'])
    .filter((v): v is string => !!v)

  // ---------- Services: CMS first, else translation ----------
  const cmsServices: ServiceItem[] | null =
    cmsDept?.services && cmsDept.services.length > 0
      ? cmsDept.services.map((s) => mapCmsService(s, loc))
      : null
  const services =
    cmsServices ??
    (isFeatured(slug)
      ? (t.raw(`departments.${slug}.detailedServices`) as ServiceItem[])
      : [])

  // ---------- FAQs ----------
  const cmsFaqs: FaqItem[] | null =
    cmsDept?.faqs && cmsDept.faqs.length > 0
      ? cmsDept.faqs.map((f) => ({
          question: f?.question?.[loc] || '',
          answer: f?.answer?.[loc] || '',
        }))
      : null
  const faqs =
    cmsFaqs ??
    (isFeatured(slug)
      ? (t.raw(`departments.${slug}.faq`) as FaqItem[])
      : [])

  // ---------- Doctors ----------
  const cmsDoctors: Doctor[] | null =
    cmsDept?.doctors && cmsDept.doctors.length > 0
      ? cmsDept.doctors.map((d) => mapCmsDoctor(d, slug))
      : null
  const doctors =
    cmsDoctors ??
    (isFeatured(slug) ? DOCTORS.filter((d) => d.department === slug) : [])

  // ---------- Before/After gallery (cosmetic — CMS only) ----------
  const cmsBeforeAfter = cmsDept?.beforeAfterImages ?? null
  const gallery: GalleryPair[] =
    cmsBeforeAfter && cmsBeforeAfter.length > 0
      ? cmsBeforeAfter.map((p) => ({
          caption: p?.treatment?.[loc] || '',
          before: urlForImage(p?.before)?.width(600).url() ?? null,
          after: urlForImage(p?.after)?.width(600).url() ?? null,
        }))
      : []

  // ---------- Equipment (CMS only) ----------
  const cmsEquipment = cmsDept?.equipment ?? null
  const equipment: EquipmentItem[] =
    cmsEquipment && cmsEquipment.length > 0
      ? cmsEquipment.map((e) => ({
          name: e?.name?.[loc] || '',
          description: e?.description?.[loc] || '',
          image: urlForImage(e?.image)?.width(900).url() ?? null,
        }))
      : []

  // ---------- Pricing ----------
  const showPrice =
    cmsDept?.showStartingPrice === true &&
    typeof cmsDept.startingPrice === 'number'

  const showEquipmentSection = slug === 'surgery' || slug === 'audiology'

  const whatsappHref = getWhatsAppUrl({
    locale: loc,
    page: isFeatured(slug)
      ? slug
      : 'home',
    service: isFeatured(slug) ? undefined : name,
  })

  const url = canonicalUrl(locale, `/departments/${slug}`)
  const specialtyJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalSpecialty',
    '@id': `${url}#specialty`,
    name,
    description,
    inLanguage: locale,
    url,
    isPartOf: { '@id': `${SITE_URL}/${locale}#business` },
    image: heroImage,
  }

  const currencyLabel = t('departments.common.currency')
  const popularLabel = t('departments.common.popular')

  // Center sparse grids: when fewer than 3 items, use flex centering so cards
  // don't stretch and the row is centered horizontally.
  const serviceGridClass =
    services.length >= 3
      ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7 place-items-stretch justify-items-center'
      : 'flex flex-wrap items-stretch justify-center gap-6 sm:gap-7'

  return (
    <>
      <JsonLd data={specialtyJsonLd} />
      <DepartmentHero
        slug={slug}
        name={name}
        tagline={tagline}
        description={description}
        image={heroImage}
      />

      {highlights.length > 0 && (
        <section className="border-y border-line bg-cream">
          <div className="container mx-auto px-4 py-6">
            <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-teal-deep">
              {highlights.map((h, i) => (
                <li key={i} className="inline-flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: accentColor || '#c9a961' }}
                  />
                  <span className="font-medium">{h}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ============================ SERVICES ============================ */}
      <RevealOnScroll>
        <section className="bg-cream-light py-20 sm:py-24 lg:py-28">
          <div className="container mx-auto px-4">
            <SectionHeader
              eyebrow={t('departments.common.servicesEyebrow')}
              title={tagline}
              description={t('departments.common.servicesSubheading')}
            />

            {services.length > 0 ? (
              <>
                <div className={serviceGridClass}>
                  {services.map((s, i) => (
                    <ServiceCard
                      key={s.slug ?? i}
                      iconName={s.iconName}
                      name={s.name}
                      description={s.description}
                      slug={s.slug ?? null}
                      departmentSlug={slug}
                      price={s.price ?? null}
                      showPrice={s.showPrice ?? false}
                      duration={s.duration ?? null}
                      isPopular={s.isPopular ?? false}
                      accentColor={accentColor}
                      currencyLabel={currencyLabel}
                      popularLabel={popularLabel}
                    />
                  ))}
                </div>
                {services.length > 0 && services.length < 3 && (
                  <p className="mt-10 text-center text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className="h-1 w-1 rounded-full bg-gold"
                      />
                      {t('departments.common.moreServicesSoon')}
                    </span>
                  </p>
                )}
              </>
            ) : (
              <EmptyState
                icon={SparkleIcon}
                title={t('departments.common.empty.servicesTitle')}
                description={t('departments.common.empty.servicesDescription')}
                ctaLabel={t('departments.common.empty.contactCta')}
                ctaHref={whatsappHref}
              />
            )}
          </div>
        </section>
      </RevealOnScroll>

      {/* ============================ BEFORE/AFTER (COSMETIC) ============================ */}
      {slug === 'cosmetic' && (
        <RevealOnScroll>
          <section className="bg-cream py-20 sm:py-24 lg:py-28">
            <div className="container mx-auto px-4">
              <SectionHeader
                eyebrow={t('departments.cosmetic.realResults.title')}
                title={t('departments.cosmetic.realResults.title')}
                description={t('departments.cosmetic.realResults.subtitle')}
              />

              {gallery.length > 0 ? (
                <>
                  <div className="grid gap-6 sm:gap-7 md:grid-cols-2 lg:grid-cols-3">
                    {gallery
                      .filter((p) => p.before && p.after)
                      .map((p, i) => (
                        <BeforeAfterSlider
                          key={i}
                          beforeSrc={p.before as string}
                          afterSrc={p.after as string}
                          beforeAlt={`${t('departments.common.gallery.before')} — ${p.caption}`}
                          afterAlt={`${t('departments.common.gallery.after')} — ${p.caption}`}
                          caption={p.caption}
                          duration={''}
                        />
                      ))}
                  </div>
                  <p className="mx-auto mt-10 max-w-2xl text-center text-xs leading-relaxed text-muted-foreground">
                    {t('departments.cosmetic.realResults.disclaimer')}
                  </p>
                </>
              ) : (
                <EmptyState
                  icon={ImageIcon}
                  title={t('departments.common.empty.galleryTitle')}
                  description={t('departments.common.empty.galleryDescription')}
                />
              )}
            </div>
          </section>
        </RevealOnScroll>
      )}

      {/* ============================ DOCTORS ============================ */}
      <RevealOnScroll>
        <section className="bg-cream py-20 sm:py-24 lg:py-28">
          <div className="container mx-auto px-4">
            <SectionHeader
              eyebrow={t('departments.common.teamHeading')}
              title={t('departments.common.teamHeading')}
              description={t('departments.common.teamSubheading')}
            />

            {doctors.length > 0 ? (
              <div
                className={
                  doctors.length >= 3
                    ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3'
                    : 'flex flex-wrap items-stretch justify-center gap-6'
                }
              >
                {doctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className={
                      doctors.length >= 3 ? '' : 'w-full max-w-[340px]'
                    }
                  >
                    <DoctorCard
                      doctor={doctor}
                      locale={locale as 'ar' | 'en'}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={StethoscopeIcon}
                title={t('departments.common.empty.doctorsTitle')}
                description={t('departments.common.empty.doctorsDescription')}
                ctaLabel={t('departments.common.empty.contactCta')}
                ctaHref={whatsappHref}
              />
            )}
          </div>
        </section>
      </RevealOnScroll>

      {/* ============================ GALLERY (non-cosmetic) ============================ */}
      {slug !== 'cosmetic' && gallery.length > 0 && (
        <RevealOnScroll>
          <section className="bg-cream-light py-20 sm:py-24 lg:py-28">
            <div className="container mx-auto px-4">
              <SectionHeader
                eyebrow={t('departments.common.gallery.heading')}
                title={t('departments.common.gallery.heading')}
                description={t('departments.common.gallery.subheading')}
              />
              <BeforeAfterGallery pairs={gallery} />
            </div>
          </section>
        </RevealOnScroll>
      )}

      {/* ============================ EQUIPMENT (surgery/audiology) ============================ */}
      {showEquipmentSection && (
        <RevealOnScroll>
          <section className="bg-cream-light py-20 sm:py-24 lg:py-28">
            <div className="container mx-auto px-4">
              <SectionHeader
                eyebrow={t('departments.common.equipment.heading')}
                title={t('departments.common.equipment.heading')}
                description={t('departments.common.equipment.subheading')}
              />
              {equipment.length > 0 ? (
                <EquipmentShowcase items={equipment} />
              ) : (
                <EmptyState
                  icon={WrenchIcon}
                  title={t('departments.common.empty.equipmentTitle')}
                  description={t('departments.common.empty.equipmentDescription')}
                />
              )}
            </div>
          </section>
        </RevealOnScroll>
      )}

      {/* ============================ FAQs ============================ */}
      <RevealOnScroll>
        <section className="bg-cream py-20 sm:py-24 lg:py-28">
          <div className="container mx-auto px-4">
            <SectionHeader
              eyebrow={t('departments.common.faqHeading')}
              title={t('departments.common.faqHeading')}
              description={t('departments.common.faqSubheading')}
            />
            {faqs.length > 0 ? (
              <FAQAccordion items={faqs} />
            ) : (
              <EmptyState
                icon={QuestionIcon}
                title={t('departments.common.empty.faqTitle')}
                description={t('departments.common.empty.faqDescription')}
                ctaLabel={t('departments.common.empty.contactCta')}
                ctaHref={whatsappHref}
              />
            )}
          </div>
        </section>
      </RevealOnScroll>

      {showPrice && (
        <RevealOnScroll>
          <section className="bg-cream-light py-14 sm:py-16">
            <div className="container mx-auto max-w-2xl px-4">
              <div
                className="rounded-2xl border border-line bg-white p-6 text-center shadow-soft sm:p-8"
                style={accentColor ? { borderColor: accentColor } : undefined}
              >
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
                  {loc === 'ar' ? 'يبدأ من' : 'Starting from'}
                </span>
                <div className="mt-2 inline-flex items-baseline gap-2 text-teal-deep">
                  <span className="font-semibold text-4xl tabular-nums sm:text-5xl">
                    {cmsDept!.startingPrice}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    {loc === 'ar' ? 'ريال' : 'SAR'}
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {loc === 'ar'
                    ? '* السعر تقريبي وقد يختلف حسب الحالة. للتأكيد تواصلوا معنا.'
                    : '* Approximate price; final cost depends on the case. Contact us to confirm.'}
                </p>
              </div>
            </div>
          </section>
        </RevealOnScroll>
      )}

      <RevealOnScroll>
        <BookingCTA />
      </RevealOnScroll>
    </>
  )
}
