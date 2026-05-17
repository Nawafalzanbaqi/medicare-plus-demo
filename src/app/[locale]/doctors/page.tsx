import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import {
  DOCTORS,
  type Doctor,
  type DoctorGender,
  type DoctorLanguage,
  type DoctorNationality,
  type DepartmentSlug,
} from '@/lib/data'
import { canonicalUrl, languageAlternates } from '@/lib/seo'
import { DoctorsDirectory } from '@/components/doctors/DoctorsDirectory'
import { getDoctors } from '@/sanity/lib/queries'
import { urlForImage } from '@/sanity/lib/image'
import type { DoctorListItem } from '@/sanity/types'

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
    title: t('doctors.title'),
    description: t('doctors.subtitle'),
    alternates: {
      canonical: canonicalUrl(locale, '/doctors'),
      languages: languageAlternates('/doctors'),
    },
    openGraph: {
      type: 'website',
      url: canonicalUrl(locale, '/doctors'),
      title: `${t('doctors.title')} | ${t('nav.brandName')}`,
      description: t('doctors.subtitle'),
      siteName: t('nav.brandName'),
      locale: locale === 'ar' ? 'ar_SA' : 'en_US',
    },
  }
}

export default async function DoctorsPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const t = await getTranslations({ locale })

  // CMS → fallback. When Sanity is empty (or unconfigured) we use the
  // hand-curated DOCTORS array from lib/data.ts so the page never goes blank.
  const cmsDoctors = await getDoctors()
  const doctors: Doctor[] =
    cmsDoctors && cmsDoctors.length > 0
      ? cmsDoctors.map(mapSanityDoctor).filter((d): d is Doctor => d !== null)
      : DOCTORS

  return (
    <>
      <section className="bg-cream-light pt-12 pb-8 sm:pt-14">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
            {t('nav.doctors')}
          </span>
          <h1 className="mt-3 font-semibold leading-[1.15] text-teal-deep text-[clamp(1.9rem,3.8vw,2.8rem)]">
            {t('doctors.title')}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {t('doctors.subtitle')}
          </p>
        </div>
      </section>

      <DoctorsDirectory doctors={doctors} />
    </>
  )
}

/**
 * Map a Sanity DoctorListItem into the existing `Doctor` shape so the
 * directory component doesn't need to know whether data came from CMS.
 * Returns null when the doctor lacks a resolvable department slug.
 */
function mapSanityDoctor(d: DoctorListItem): Doctor | null {
  const deptSlug = d.department?.slug?.current as DepartmentSlug | undefined
  if (!deptSlug) return null
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
    languages: ((d.languages ?? ['ar', 'en']) as DoctorLanguage[]),
  }
}
