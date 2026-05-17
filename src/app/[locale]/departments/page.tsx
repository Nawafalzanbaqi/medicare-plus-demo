import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { ArrowRight } from 'lucide-react'
import type { Icon } from '@phosphor-icons/react'
import {
  BabyIcon,
  BoneIcon,
  EarIcon,
  EyeIcon,
  FirstAidIcon,
  FlaskIcon,
  FlowerIcon,
  ImageIcon,
  SparkleIcon,
  StethoscopeIcon,
  ToothIcon,
  WhatsappLogoIcon,
} from '@phosphor-icons/react/dist/ssr'

import { routing } from '@/i18n/routing'
import { Link } from '@/i18n/navigation'
import { RevealOnScroll } from '@/components/shared/RevealOnScroll'
import { canonicalUrl, languageAlternates } from '@/lib/seo'
import { ALL_DEPARTMENTS } from '@/lib/data'
import { getWhatsAppUrl } from '@/lib/whatsapp'
import { getAllDepartments } from '@/sanity/lib/queries'
import type { DepartmentRef, Locale } from '@/sanity/types'

type Params = { locale: string }

const FEATURED_SLUGS = new Set(['cosmetic', 'surgery', 'audiology'])

const PHOSPHOR_ICONS: Record<string, Icon> = {
  sparkle: SparkleIcon,
  scalpel: FirstAidIcon,
  'first-aid': FirstAidIcon,
  ear: EarIcon,
  tooth: ToothIcon,
  stethoscope: StethoscopeIcon,
  baby: BabyIcon,
  flower: FlowerIcon,
  bone: BoneIcon,
  eye: EyeIcon,
  flask: FlaskIcon,
  'x-ray': ImageIcon,
}

function pickIcon(iconName?: string | null): Icon {
  return (iconName && PHOSPHOR_ICONS[iconName]) || SparkleIcon
}

type DepartmentCard = {
  slug: string
  name: string
  tagline: string | null
  description: string
  iconName: string
  isFeatured: boolean
  displayOrder: number
}

type TFn = Awaited<ReturnType<typeof getTranslations>>

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}

  const t = await getTranslations({ locale })
  const path = '/departments'
  const url = canonicalUrl(locale, path)
  const title = t('departmentsList.metaTitle')
  const description = t('departmentsList.metaDescription')

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: languageAlternates(path),
    },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      siteName: t('nav.brandName'),
      locale: locale === 'ar' ? 'ar_SA' : 'en_US',
      alternateLocale: locale === 'ar' ? ['en_US'] : ['ar_SA'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

function buildFromFallback(t: TFn): DepartmentCard[] {
  return ALL_DEPARTMENTS.map((d, idx) => {
    if (d.featured) {
      return {
        slug: d.slug,
        name: t(`featuredDepartments.${d.slug}.name`),
        tagline: t(`featuredDepartments.${d.slug}.tagline`),
        description: t(`featuredDepartments.${d.slug}.description`),
        iconName: d.iconName,
        isFeatured: true,
        displayOrder: idx,
      }
    }
    return {
      slug: d.slug,
      name: t(`allDepartments.${d.slug}.name`),
      tagline: null,
      description: t(`allDepartments.${d.slug}.description`),
      iconName: d.iconName,
      isFeatured: false,
      displayOrder: idx,
    }
  })
}

function buildFromCms(
  cms: DepartmentRef[],
  loc: Locale,
  t: TFn,
): DepartmentCard[] {
  const other: Locale = loc === 'ar' ? 'en' : 'ar'

  return cms
    .filter((d): d is NonNullable<DepartmentRef> => !!d && !!d.slug?.current)
    .map((d, idx) => {
      const slug = d.slug!.current
      const known = ALL_DEPARTMENTS.find((dep) => dep.slug === slug)
      const isFeaturedKnown = FEATURED_SLUGS.has(slug)

      const cmsName = d.name?.[loc] || d.name?.[other]
      const name =
        cmsName ||
        (isFeaturedKnown
          ? t(`featuredDepartments.${slug}.name`)
          : known
            ? t(`allDepartments.${slug}.name`)
            : slug)

      const cmsTagline = d.tagline?.[loc] || d.tagline?.[other]
      const tagline =
        cmsTagline ||
        (isFeaturedKnown ? t(`featuredDepartments.${slug}.tagline`) : null)

      const cmsDesc = d.shortDescription?.[loc] || d.shortDescription?.[other]
      const description =
        cmsDesc ||
        (isFeaturedKnown
          ? t(`featuredDepartments.${slug}.description`)
          : known
            ? t(`allDepartments.${slug}.description`)
            : '')

      return {
        slug,
        name,
        tagline,
        description,
        iconName: d.iconName || known?.iconName || 'sparkle',
        isFeatured: d.isFeatured === true || isFeaturedKnown,
        displayOrder: d.displayOrder ?? idx,
      }
    })
    .sort((a, b) => a.displayOrder - b.displayOrder)
}

export default async function DepartmentsIndexPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const t = await getTranslations({ locale })
  const loc = locale as Locale

  const cms = await getAllDepartments()
  const all: DepartmentCard[] =
    cms && cms.length > 0 ? buildFromCms(cms, loc, t) : buildFromFallback(t)

  const featured = all.filter((d) => d.isFeatured)
  const others = all.filter((d) => !d.isFeatured)

  const whatsappHref = getWhatsAppUrl({ locale: loc, page: 'home' })

  return (
    <>
      <section className="relative overflow-hidden bg-cream-light pt-16 pb-12 sm:pt-20 sm:pb-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(201,169,97,0.10) 0%, transparent 60%)',
          }}
        />
        <div className="container relative mx-auto max-w-4xl px-4 text-center">
          <div className="mb-5 inline-flex items-center gap-4">
            <span aria-hidden="true" className="h-px w-10 bg-gold/40" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
              {t('departmentsList.hero.eyebrow')}
            </span>
            <span aria-hidden="true" className="h-px w-10 bg-gold/40" />
          </div>
          <h1 className="font-semibold leading-[1.1] text-teal-deep text-[clamp(2rem,4.2vw,3.4rem)]">
            {t('departmentsList.hero.title')}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t('departmentsList.hero.description')}
          </p>
        </div>
      </section>

      {featured.length > 0 && (
        <RevealOnScroll>
          <section className="bg-cream-light pb-16 sm:pb-20">
            <div className="container mx-auto px-4">
              <div className="mx-auto mb-10 max-w-2xl text-center">
                <h2 className="font-semibold leading-[1.2] text-teal-deep text-[clamp(1.5rem,2.6vw,2rem)]">
                  {t('departmentsList.featured.title')}
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-3 lg:gap-7">
                {featured.map((dept) => {
                  const Icon = pickIcon(dept.iconName)
                  return (
                    <Link
                      key={dept.slug}
                      href={`/departments/${dept.slug}`}
                      className="group relative flex flex-col rounded-2xl border border-line bg-white p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-medium"
                    >
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-0 top-0 h-[3px] origin-[0%_50%] scale-x-0 bg-gold transition-transform duration-500 ease-out group-hover:scale-x-100 rtl:origin-[100%_50%]"
                      />
                      <span className="grid h-14 w-14 place-items-center rounded-xl bg-gold/10 ring-1 ring-gold/25 transition-colors group-hover:bg-gold/20">
                        <Icon size={32} weight="duotone" className="text-gold" />
                      </span>
                      <h3 className="mt-5 text-xl font-semibold text-teal-deep sm:text-[1.35rem]">
                        {dept.name}
                      </h3>
                      {dept.tagline && (
                        <p className="mt-1 text-sm font-medium text-gold">
                          {dept.tagline}
                        </p>
                      )}
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {dept.description}
                      </p>
                      <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-teal-deep transition-colors group-hover:text-gold">
                        {t('common.exploreDepartment')}
                        <ArrowRight
                          aria-hidden="true"
                          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                        />
                      </span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        </RevealOnScroll>
      )}

      {others.length > 0 && (
        <RevealOnScroll>
          <section className="bg-cream py-16 sm:py-20">
            <div className="container mx-auto px-4">
              <div className="mx-auto mb-10 max-w-2xl text-center">
                <h2 className="font-semibold leading-[1.2] text-teal-deep text-[clamp(1.5rem,2.6vw,2rem)]">
                  {t('departmentsList.allDepartments.title')}
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
                {others.map((dept) => {
                  const Icon = pickIcon(dept.iconName)
                  return (
                    <Link
                      key={dept.slug}
                      href={`/departments/${dept.slug}`}
                      className="group relative flex flex-col rounded-2xl border border-line bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-soft"
                    >
                      <span className="grid h-12 w-12 place-items-center rounded-xl bg-cream-light ring-1 ring-line transition-colors group-hover:bg-gold/10 group-hover:ring-gold/30">
                        <Icon
                          size={28}
                          weight="duotone"
                          className="text-teal-deep transition-colors group-hover:text-gold"
                        />
                      </span>
                      <h3 className="mt-4 text-base font-semibold text-teal-deep">
                        {dept.name}
                      </h3>
                      {dept.description && (
                        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                          {dept.description}
                        </p>
                      )}
                      <ArrowRight
                        aria-hidden="true"
                        className="mt-4 h-4 w-4 self-start text-teal-deep/40 transition-all duration-300 group-hover:translate-x-1 group-hover:text-gold rtl:rotate-180 rtl:group-hover:-translate-x-1"
                      />
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        </RevealOnScroll>
      )}

      <RevealOnScroll>
        <section className="relative overflow-hidden bg-teal-deep py-16 text-cream-light sm:py-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 70% 60% at 100% 0%, rgba(201,169,97,0.10) 0%, transparent 60%), radial-gradient(ellipse 70% 60% at 0% 100%, rgba(201,169,97,0.08) 0%, transparent 60%)',
            }}
          />
          <div className="container relative mx-auto max-w-2xl px-4 text-center">
            <h2 className="font-semibold leading-[1.2] text-cream-light text-[clamp(1.5rem,2.6vw,2rem)]">
              {t('departmentsList.cta.title')}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-cream-light/75">
              {t('departmentsList.cta.description')}
            </p>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex h-12 items-center gap-2 rounded-lg bg-gold px-6 text-sm font-semibold text-teal-deep shadow-medium transition-all hover:bg-gold-soft hover:shadow-gold-glow"
            >
              <WhatsappLogoIcon size={18} weight="fill" aria-hidden="true" />
              {t('departmentsList.cta.button')}
            </a>
          </div>
        </section>
      </RevealOnScroll>
    </>
  )
}
