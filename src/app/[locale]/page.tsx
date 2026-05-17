import { setRequestLocale } from 'next-intl/server'
import { Hero } from '@/components/sections/Hero'
import { TrustBadges } from '@/components/sections/TrustBadges'
import { FeaturedDepartments } from '@/components/sections/FeaturedDepartments'
import { TrustStrip } from '@/components/sections/TrustStrip'
import { AllDepartments } from '@/components/sections/AllDepartments'
import { WhyUs } from '@/components/sections/WhyUs'
import { Testimonials } from '@/components/sections/Testimonials'
import { BookingCTA } from '@/components/sections/BookingCTA'
import { RevealOnScroll } from '@/components/shared/RevealOnScroll'
import { getApprovedTestimonials, getHomePage } from '@/sanity/lib/queries'
import {
  ALL_SECTION_KEYS,
  type HomePageData,
  type SectionKey,
  type TestimonialDoc,
} from '@/sanity/types'
import type { DepartmentSlug, Testimonial } from '@/lib/data'

const DEFAULT_ORDER: SectionKey[] = [
  'hero',
  'featuredDepartments',
  'trustStrip',
  'allDepartments',
  'whyUs',
  'testimonialsSection',
  'bookingCTA',
]

function isValidKey(k: string): k is SectionKey {
  return (ALL_SECTION_KEYS as readonly string[]).includes(k)
}

function isSectionVisible(home: HomePageData | null, key: SectionKey) {
  if (!home) return true
  const section = home[key as keyof HomePageData] as { isVisible?: boolean | null } | undefined
  if (!section) return true
  return section.isVisible !== false
}

type SectionContext = {
  home: HomePageData | null
  testimonials: Testimonial[] | undefined
}

function renderSection(key: SectionKey, ctx: SectionContext) {
  const { home, testimonials } = ctx
  switch (key) {
    case 'hero':
      return <Hero key="hero" data={home?.hero} />
    case 'featuredDepartments':
      return (
        <RevealOnScroll key="featuredDepartments">
          <FeaturedDepartments data={home?.featuredDepartments} />
        </RevealOnScroll>
      )
    case 'trustStrip':
      return (
        <RevealOnScroll key="trustStrip">
          <TrustStrip data={home?.trustStrip} />
        </RevealOnScroll>
      )
    case 'allDepartments':
      return (
        <RevealOnScroll key="allDepartments">
          <AllDepartments data={home?.allDepartments} />
        </RevealOnScroll>
      )
    case 'whyUs':
      return (
        <RevealOnScroll key="whyUs">
          <WhyUs data={home?.whyUs} />
        </RevealOnScroll>
      )
    case 'testimonialsSection':
      return (
        <RevealOnScroll key="testimonialsSection">
          <Testimonials
            data={home?.testimonialsSection}
            testimonials={testimonials}
          />
        </RevealOnScroll>
      )
    case 'bookingCTA':
      return (
        <RevealOnScroll key="bookingCTA">
          <BookingCTA data={home?.bookingCTA} />
        </RevealOnScroll>
      )
  }
}

function mapTestimonial(t: TestimonialDoc): Testimonial | null {
  const slug = t.department?.slug?.current as DepartmentSlug | undefined
  if (!slug) return null
  const rating = (t.rating === 4 || t.rating === 5 ? t.rating : 5) as 4 | 5
  return {
    id: t._id,
    name: {
      ar: t.patientName?.ar || '',
      en: t.patientName?.en || '',
    },
    comment: {
      ar: t.comment?.ar || '',
      en: t.comment?.en || '',
    },
    departmentSlug: slug,
    rating,
  }
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const [home, cmsTestimonials] = await Promise.all([
    getHomePage(),
    getApprovedTestimonials(),
  ])

  const testimonials = cmsTestimonials
    ?.map(mapTestimonial)
    .filter((t): t is Testimonial => t !== null)
  const ctx: SectionContext = {
    home,
    testimonials: testimonials && testimonials.length > 0 ? testimonials : undefined,
  }

  // Resolve the section order: CMS-controlled if present, otherwise default.
  const cmsOrder = home?.sectionOrder?.filter(isValidKey) ?? []
  const order: SectionKey[] = cmsOrder.length > 0 ? cmsOrder : DEFAULT_ORDER

  const rest = order.filter((k) => k !== 'hero')

  return (
    <>
      {isSectionVisible(home, 'hero') && renderSection('hero', ctx)}

      <RevealOnScroll>
        <TrustBadges />
      </RevealOnScroll>

      {rest.map((key) =>
        isSectionVisible(home, key) ? renderSection(key, ctx) : null,
      )}
    </>
  )
}
