import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { BookingFlow, type FlowDepartment } from '@/components/booking/BookingFlow'
import { sanityFetch } from '@/sanity/lib/client'
import { canonicalUrl, languageAlternates } from '@/lib/seo'

type Params = { locale: string }
type SearchParams = {
  department?: string
  service?: string
  doctor?: string
  offer?: string
  support?: string
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}

  const t = await getTranslations({ locale })
  const path = '/book'

  return {
    title: t('bookingFlow.metaTitle'),
    description: t('bookingFlow.metaDescription'),
    alternates: {
      canonical: canonicalUrl(locale, path),
      languages: languageAlternates(path),
    },
    openGraph: {
      type: 'website',
      url: canonicalUrl(locale, path),
      title: t('bookingFlow.metaTitle'),
      description: t('bookingFlow.metaDescription'),
      siteName: t('nav.brandName'),
      locale: locale === 'ar' ? 'ar_SA' : 'en_US',
    },
    robots: { index: false, follow: true },
  }
}

/* Server-side query — mirrors /api/booking-options exactly. */
const BOOKING_OPTIONS_QUERY = /* groq */ `
  {
    "departments": *[_type == "department" && (isActive != false)]
      | order(coalesce(displayOrder, 100) asc) {
        _id,
        "slug": slug.current,
        name,
        shortDescription,
        "icon": icon,
        accentColor,
        isFeatured,
        "services": *[_type == "service" && department._ref == ^._id && defined(slug.current)]
          | order(coalesce(order, 100) asc) {
            _id,
            "slug": slug.current,
            name,
            description,
            icon,
            price,
            showPrice,
            duration,
            isPopular
          }
      },
    "servicesBySlug": *[_type == "service" && defined(slug.current) && defined(department->slug.current)] {
      _id,
      "slug": slug.current,
      name,
      description,
      icon,
      price,
      showPrice,
      duration,
      isPopular,
      "departmentSlug": department->slug.current
    } | order(coalesce(order, 100) asc)
  }
`

type ServerResult = {
  departments: FlowDepartment[] | null
  servicesBySlug: (FlowDepartment['services'][number] & {
    departmentSlug: string
  })[] | null
}

function mergeFallbackServices(result: ServerResult): FlowDepartment[] {
  const departments = result.departments ?? []
  const bySlug = new Map<string, FlowDepartment['services']>()
  for (const row of result.servicesBySlug ?? []) {
    const { departmentSlug, ...service } = row
    if (!bySlug.has(departmentSlug)) bySlug.set(departmentSlug, [])
    bySlug.get(departmentSlug)!.push(service)
  }
  return departments.map((d) => {
    if (d.services && d.services.length > 0) return d
    return { ...d, services: bySlug.get(d.slug) ?? [] }
  })
}

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<Params>
  searchParams: Promise<SearchParams>
}) {
  const [{ locale }, sp] = await Promise.all([params, searchParams])
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const t = await getTranslations({ locale })

  const result = await sanityFetch<ServerResult>(
    BOOKING_OPTIONS_QUERY,
    {},
    { tags: ['department', 'service'] },
  )
  const departments = result ? mergeFallbackServices(result) : []

  const initialDepartmentSlug = sp.department ?? null
  const initialServiceSlug = sp.service ?? null
  const isSupport = sp.support === 'true'

  return (
    <section className="bg-cream-light py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto max-w-4xl px-4">
        <header className="mb-10 text-center">
          <h1 className="font-semibold leading-[1.1] text-teal-deep text-[clamp(2rem,4vw,3rem)]">
            {t('bookingFlow.title')}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t('bookingFlow.subtitle')}
          </p>
        </header>

        <div className="rounded-3xl border border-line bg-cream-light p-6 shadow-soft sm:p-10">
          <BookingFlow
            departments={departments}
            initialDepartmentSlug={initialDepartmentSlug}
            initialServiceSlug={initialServiceSlug}
            isSupport={isSupport}
          />
        </div>
      </div>
    </section>
  )
}
