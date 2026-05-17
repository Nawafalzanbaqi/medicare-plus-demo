import { sanityFetch } from './client'
import type {
  ArticleFull,
  ArticleListItem,
  DepartmentFull,
  DepartmentRef,
  DoctorFull,
  DoctorListItem,
  HomePageData,
  InsuranceDoc,
  OfferDoc,
  ServiceFull,
  TestimonialDoc,
} from '../types'

export type Localized<T = string> = { ar: T; en: T } | null

export type SiteSettings = {
  siteName: Localized
  tagline: Localized
  logo: unknown
  favicon: unknown
  yearEstablished: number | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  address: Localized
  workingHours: Localized
  socialLinks: {
    instagram?: string
    snapchat?: string
    twitter?: string
    tiktok?: string
    youtube?: string
  } | null
  primaryColor: string | null
  accentColor: string | null
  isMaintenanceMode: boolean | null
}

export type TopBarConfig = {
  isVisible: boolean | null
  showHours: boolean | null
  showPhone: boolean | null
  showLanguageSwitcher: boolean | null
  backgroundColor: string | null
  textColor: string | null
}

export type TrustBarItem = {
  _key?: string
  icon: string | null
  text: Localized
  link: string | null
}

export type TrustBarConfig = {
  isVisible: boolean | null
  items: TrustBarItem[] | null
  backgroundColor: string | null
  textColor: string | null
}

export type FooterColumn = {
  title: Localized
  links: { label: Localized; url: string }[]
}

export type FooterConfig = {
  description: Localized
  backgroundColor: string | null
  showSocialLinks: boolean | null
  columnsConfig: FooterColumn[] | null
  copyrightText: Localized
  bottomBadges: { _key: string; asset: unknown; alt?: string }[] | null
}

const siteSettingsQuery = /* groq */ `
  *[_type == "siteSettings"][0]{
    siteName, tagline, logo, favicon, yearEstablished,
    phone, whatsapp, email, address, workingHours,
    socialLinks, primaryColor, accentColor, isMaintenanceMode
  }
`

const topBarQuery = /* groq */ `
  *[_type == "topBar"][0]{
    isVisible, showHours, showPhone, showLanguageSwitcher,
    backgroundColor, textColor
  }
`

const trustBarQuery = /* groq */ `
  *[_type == "trustBar"][0]{
    isVisible,
    "items": items[]{ _key, icon, text, link },
    backgroundColor, textColor
  }
`

const footerQuery = /* groq */ `
  *[_type == "footer"][0]{
    description, backgroundColor, showSocialLinks,
    copyrightText,
    "columnsConfig": columnsConfig[]{
      title,
      "links": links[]{ label, url }
    },
    "bottomBadges": bottomBadges[]{ _key, asset, alt }
  }
`

export const getSiteSettings = () =>
  sanityFetch<SiteSettings>(siteSettingsQuery, {}, { tags: ['siteSettings'] })

export const getTopBar = () =>
  sanityFetch<TopBarConfig>(topBarQuery, {}, { tags: ['topBar'] })

export const getTrustBar = () =>
  sanityFetch<TrustBarConfig>(trustBarQuery, {}, { tags: ['trustBar'] })

export const getFooter = () =>
  sanityFetch<FooterConfig>(footerQuery, {}, { tags: ['footer'] })

/* -----------------------------------------------------------------------
 * Home page
 * ----------------------------------------------------------------------- */

const departmentProjection = /* groq */ `{
  _id,
  "slug": slug,
  name,
  tagline,
  shortDescription,
  description,
  iconName,
  heroImage,
  isFeatured,
  displayOrder
}`

export const HOME_PAGE_QUERY = /* groq */ `
  *[_type == "homePage"][0]{
    sectionOrder,
    hero{
      isVisible, badge, title, description,
      primaryCTA, secondaryCTA, stats,
      heroImage, floatingCards,
      backgroundStyle, customBackground
    },
    featuredDepartments{
      isVisible, eyebrow, title, description,
      backgroundColor, showNumbers,
      "departments": departments[]-> ${departmentProjection}
    },
    trustStrip{
      isVisible,
      "items": items[]{ icon, title, description }
    },
    allDepartments{
      isVisible, eyebrow, title,
      "departments": departments[]-> ${departmentProjection}
    },
    whyUs{
      isVisible, eyebrow, title, description,
      "features": features[]{ icon, title, description },
      showCounter, counterStartYear,
      "badges": badges[]{ _key, asset, alt }
    },
    testimonialsSection{
      isVisible, eyebrow, title, description,
      showOnlyApproved, autoScroll
    },
    bookingCTA{
      isVisible, eyebrow, title, description,
      whatsappButton, phoneButton,
      backgroundColor, backgroundImage
    }
  }
`

export const getHomePage = () =>
  sanityFetch<HomePageData>(HOME_PAGE_QUERY, {}, { tags: ['homePage'] })

/* -----------------------------------------------------------------------
 * Department by slug (full page data with resolved references)
 * ----------------------------------------------------------------------- */

const serviceProjection = /* groq */ `{
  _id, slug, name, description, icon, image,
  price, showPrice, duration, isPopular, order
}`

const doctorProjection = /* groq */ `{
  _id, slug, name, titlePrefix, specialty,
  yearsExperience, photo, gender, nationality, languages, displayOrder
}`

export const DEPARTMENT_BY_SLUG_QUERY = /* groq */ `
  *[_type == "department" && slug.current == $slug && (isActive != false)][0]{
    _id, slug, name, tagline, shortDescription, fullDescription,
    isFeatured, featuredOrder, displayOrder, isActive,
    icon, "lottieFile": lottieFile.asset->{url}, coverImage, heroImage,
    "gallery": gallery[]{ _key, asset, alt },
    backgroundColor, accentColor,
    "services": services[]->${serviceProjection} | order(order asc),
    "doctors": doctors[]->${doctorProjection} | order(displayOrder asc),
    highlights,
    "faqs": faqs[]{ question, answer },
    "beforeAfterImages": beforeAfterImages[]{ _key, treatment, before, after, duration },
    "equipment": equipment[]{ _key, name, description, image },
    startingPrice, showStartingPrice,
    seo
  }
`

const ALL_DEPARTMENT_SLUGS_QUERY = /* groq */ `
  *[_type == "department" && defined(slug.current) && (isActive != false)].slug.current
`

const ALL_DEPARTMENTS_QUERY = /* groq */ `
  *[_type == "department" && (isActive != false)]${departmentProjection}
    | order(coalesce(displayOrder, 100) asc)
`

export const getDepartmentBySlug = (slug: string) =>
  sanityFetch<DepartmentFull>(
    DEPARTMENT_BY_SLUG_QUERY,
    { slug },
    { tags: ['department', `department:${slug}`] },
  )

export const getAllDepartmentSlugs = () =>
  sanityFetch<string[]>(ALL_DEPARTMENT_SLUGS_QUERY, {}, { tags: ['department'] })

export const getAllDepartments = () =>
  sanityFetch<DepartmentRef[]>(ALL_DEPARTMENTS_QUERY, {}, { tags: ['department'] })

/* -----------------------------------------------------------------------
 * Doctors directory
 * ----------------------------------------------------------------------- */

const doctorListProjection = /* groq */ `{
  _id, slug, name, titlePrefix, specialty, yearsExperience, photo,
  gender, nationality, languages, isAvailable, isFeatured, displayOrder,
  "department": department->{
    _id, slug, name
  }
}`

const DOCTORS_QUERY = /* groq */ `
  *[_type == "doctor" && (isAvailable != false)]${doctorListProjection}
    | order(displayOrder asc, yearsExperience desc)
`

export const getDoctors = () =>
  sanityFetch<DoctorListItem[]>(DOCTORS_QUERY, {}, { tags: ['doctor'] })

/* -----------------------------------------------------------------------
 * Articles (blog list + by slug)
 * ----------------------------------------------------------------------- */

const articleListProjection = /* groq */ `{
  _id, title, slug, excerpt, featuredImage, readTime, publishedAt, isFeatured,
  "category": category->{ _id, slug, name },
  "author": author->{ _id, name, titlePrefix, photo },
  authorOverride
}`

const ARTICLES_QUERY = /* groq */ `
  *[_type == "article" && isPublished == true]${articleListProjection}
    | order(publishedAt desc)
`

const ARTICLE_BY_SLUG_QUERY = /* groq */ `
  *[_type == "article" && isPublished == true
    && (slug.ar.current == $slug || slug.en.current == $slug)][0]{
    ${articleListProjection.slice(1, -1)},
    content,
    "gallery": gallery[]{ _key, asset, alt },
    tags,
    seo
  }
`

export const getArticles = () =>
  sanityFetch<ArticleListItem[]>(ARTICLES_QUERY, {}, { tags: ['article'] })

export const getArticleBySlug = (slug: string) =>
  sanityFetch<ArticleFull>(
    ARTICLE_BY_SLUG_QUERY,
    { slug },
    { tags: ['article', `article:${slug}`] },
  )

/* -----------------------------------------------------------------------
 * Testimonials (approved only by default)
 * ----------------------------------------------------------------------- */

const testimonialProjection = /* groq */ `{
  _id, patientName, patientInitial, rating, comment, date, avatarColor, isFeatured,
  "department": department->{ _id, slug, name },
  "service": service->{ _id, name }
}`

const APPROVED_TESTIMONIALS_QUERY = /* groq */ `
  *[_type == "testimonial" && isApproved == true]${testimonialProjection}
    | order(coalesce(displayOrder, 100) asc, date desc)
`

export const getApprovedTestimonials = () =>
  sanityFetch<TestimonialDoc[]>(APPROVED_TESTIMONIALS_QUERY, {}, { tags: ['testimonial'] })

/* -----------------------------------------------------------------------
 * Offers (active + non-expired)
 * ----------------------------------------------------------------------- */

const offerProjection = /* groq */ `{
  _id, title, description, image, badgeText,
  originalPrice, offerPrice, currency,
  validFrom, validUntil, terms, maxBookings, isFeatured,
  "department": department->{ _id, slug, name },
  "service": service->{ _id, name }
}`

const ACTIVE_OFFERS_QUERY = /* groq */ `
  *[_type == "offer" && isActive == true && dateTime(validUntil) > dateTime(now())]${offerProjection}
    | order(isFeatured desc, validUntil asc)
`

export const getActiveOffers = () =>
  sanityFetch<OfferDoc[]>(ACTIVE_OFFERS_QUERY, {}, { tags: ['offer'] })

/* -----------------------------------------------------------------------
 * Insurance providers (with full coverage matrix)
 * ----------------------------------------------------------------------- */

const insuranceProjection = /* groq */ `{
  _id, name, shortLabel, logo, website, brandColor, coverageNote, isActive, displayOrder,
  "coverageRules": coverageRules[]{
    _key, percentage, requiresApproval, notes,
    "service": service->{
      _id, name, order,
      "department": department->{ _id, slug, name, "iconName": icon, displayOrder }
    }
  }
}`

const ACTIVE_INSURANCE_QUERY = /* groq */ `
  *[_type == "insurance" && isActive == true]${insuranceProjection}
    | order(displayOrder asc)
`

export const getActiveInsurance = () =>
  sanityFetch<InsuranceDoc[]>(ACTIVE_INSURANCE_QUERY, {}, { tags: ['insurance'] })

/* -----------------------------------------------------------------------
 * Service detail by slug
 * ----------------------------------------------------------------------- */

const SERVICE_BY_SLUG_QUERY = /* groq */ `
  *[_type == "service" && slug.current == $slug][0]{
    _id, slug, name, description, icon, image,
    price, showPrice, duration, isPopular, order,
    detailedDescription, benefits, preparation, aftercare,
    "faqs": faqs[]{ question, answer },
    "department": department->{
      _id, slug, name, accentColor
    }
  }
`

const ALL_SERVICE_SLUGS_QUERY = /* groq */ `
  *[_type == "service" && defined(slug.current)].slug.current
`

const RELATED_SERVICES_QUERY = /* groq */ `
  *[_type == "service"
    && _id != $excludeId
    && defined(slug.current)
    && department._ref == $departmentId
  ]{
    _id, slug, name, description, icon, image, price, showPrice, duration, isPopular, order
  } | order(coalesce(order, 100) asc)[0...3]
`

const DOCTORS_BY_DEPARTMENT_QUERY = /* groq */ `
  *[_type == "doctor"
    && department._ref == $departmentId
    && (isAvailable != false)
  ]${doctorListProjection}
    | order(coalesce(displayOrder, 100) asc, yearsExperience desc)
`

export const getServiceBySlug = (slug: string) =>
  sanityFetch<ServiceFull>(
    SERVICE_BY_SLUG_QUERY,
    { slug },
    { tags: ['service', `service:${slug}`] },
  )

export const getAllServiceSlugs = () =>
  sanityFetch<string[]>(ALL_SERVICE_SLUGS_QUERY, {}, { tags: ['service'] })

export const getRelatedServices = (departmentId: string, excludeId: string) =>
  sanityFetch<ServiceFull[]>(
    RELATED_SERVICES_QUERY,
    { departmentId, excludeId },
    { tags: ['service'] },
  )

export const getDoctorsByDepartmentId = (departmentId: string) =>
  sanityFetch<DoctorListItem[]>(
    DOCTORS_BY_DEPARTMENT_QUERY,
    { departmentId },
    { tags: ['doctor'] },
  )

/* -----------------------------------------------------------------------
 * Doctor detail by slug
 * ----------------------------------------------------------------------- */

const DOCTOR_BY_SLUG_QUERY = /* groq */ `
  *[_type == "doctor" && slug.current == $slug && (isAvailable != false)][0]{
    _id, slug, name, titlePrefix, specialty,
    yearsExperience, photo, gender, nationality, languages,
    bio, qualifications, workingDays, workingHours,
    "department": department->{ _id, slug, name, accentColor }
  }
`

const ALL_DOCTOR_SLUGS_QUERY = /* groq */ `
  *[_type == "doctor" && defined(slug.current) && (isAvailable != false)].slug.current
`

export const getDoctorBySlug = (slug: string) =>
  sanityFetch<DoctorFull>(
    DOCTOR_BY_SLUG_QUERY,
    { slug },
    { tags: ['doctor', `doctor:${slug}`] },
  )

export const getAllDoctorSlugs = () =>
  sanityFetch<string[]>(ALL_DOCTOR_SLUGS_QUERY, {}, { tags: ['doctor'] })
