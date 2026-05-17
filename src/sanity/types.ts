/**
 * Hand-written TypeScript types matching the Sanity schemas.
 * Mirrors the shape returned by HOME_PAGE_QUERY in lib/queries.ts.
 *
 * Once a real Sanity project exists, regenerate with:
 *   npx sanity@latest typegen generate
 * and replace this file with the generated `sanity.types.ts`.
 */

export type Locale = 'ar' | 'en'

export type LocalizedString = { ar: string; en: string }
export type LocalizedText = { ar: string; en: string }

export type PortableTextBlock = {
  _type: 'block'
  _key?: string
  style?: string
  children?: Array<{
    _type: 'span'
    _key?: string
    text: string
    marks?: string[]
  }>
}
export type LocalizedRichText = {
  ar?: PortableTextBlock[] | null
  en?: PortableTextBlock[] | null
}

export type SanityImage = {
  asset?: { _ref: string; _type: 'reference' } | { url?: string }
  hotspot?: { x: number; y: number; height: number; width: number }
  alt?: string
} | null

export type ButtonStyle = 'primary' | 'secondary' | 'outline' | 'ghost'
export type WhatsAppContext =
  | 'home'
  | 'cosmetic'
  | 'surgery'
  | 'audiology'
  | 'offers'
  | 'general'

export type ButtonValue = {
  label?: LocalizedString | null
  url?: string | null
  style?: ButtonStyle | null
  icon?: string | null
  opensInWhatsApp?: boolean | null
  whatsappContext?: WhatsAppContext | null
  openInNewTab?: boolean | null
} | null

export type CardValue = {
  title?: LocalizedString | null
  description?: LocalizedText | null
  icon?: string | null
  image?: SanityImage
  backgroundColor?: string | null
  textColor?: string | null
  badge?: LocalizedString | null
  order?: number | null
  cta?: ButtonValue
} | null

export type StatItemValue = {
  value: number
  prefix?: string | null
  suffix?: string | null
  decimals?: number | null
  label?: LocalizedString | null
} | null

export type FaqValue = {
  question?: LocalizedString | null
  answer?: LocalizedText | null
} | null

/* ---------------- Home page sections ---------------- */

export type HeroSection = {
  isVisible?: boolean | null
  badge?: LocalizedString | null
  title?: LocalizedRichText | null
  description?: LocalizedText | null
  primaryCTA?: ButtonValue
  secondaryCTA?: ButtonValue
  stats?: StatItemValue[] | null
  heroImage?: SanityImage
  floatingCards?: CardValue[] | null
  backgroundStyle?:
    | 'cream-gradient'
    | 'teal-subtle'
    | 'solid-cream'
    | 'custom'
    | null
  customBackground?: SanityImage
} | null

export type DepartmentRef = {
  _id: string
  slug?: { current: string } | null
  name?: LocalizedString | null
  tagline?: LocalizedString | null
  shortDescription?: LocalizedText | null
  description?: LocalizedText | null
  iconName?: string | null
  heroImage?: SanityImage
  isFeatured?: boolean | null
  displayOrder?: number | null
} | null

export type FeaturedDepartmentsSection = {
  isVisible?: boolean | null
  eyebrow?: LocalizedString | null
  title?: LocalizedString | null
  description?: LocalizedText | null
  departments?: DepartmentRef[] | null
  backgroundColor?: string | null
  showNumbers?: boolean | null
} | null

export type TrustItem = {
  icon?: string | null
  title?: LocalizedString | null
  description?: LocalizedString | null
}
export type TrustStripSection = {
  isVisible?: boolean | null
  items?: TrustItem[] | null
} | null

export type AllDepartmentsSection = {
  isVisible?: boolean | null
  eyebrow?: LocalizedString | null
  title?: LocalizedString | null
  departments?: DepartmentRef[] | null
} | null

export type WhyUsFeature = {
  icon?: string | null
  title?: LocalizedString | null
  description?: LocalizedString | null
}
export type WhyUsSection = {
  isVisible?: boolean | null
  eyebrow?: LocalizedString | null
  title?: LocalizedString | null
  description?: LocalizedText | null
  features?: WhyUsFeature[] | null
  showCounter?: boolean | null
  counterStartYear?: number | null
  badges?: Array<{ _key?: string; asset?: unknown; alt?: string }> | null
} | null

export type TestimonialsSection = {
  isVisible?: boolean | null
  eyebrow?: LocalizedString | null
  title?: LocalizedString | null
  description?: LocalizedText | null
  showOnlyApproved?: boolean | null
  autoScroll?: boolean | null
} | null

export type BookingCTASection = {
  isVisible?: boolean | null
  eyebrow?: LocalizedString | null
  title?: LocalizedRichText | null
  description?: LocalizedText | null
  whatsappButton?: ButtonValue
  phoneButton?: ButtonValue
  backgroundColor?: string | null
  backgroundImage?: SanityImage
} | null

export const ALL_SECTION_KEYS = [
  'hero',
  'featuredDepartments',
  'trustStrip',
  'allDepartments',
  'whyUs',
  'testimonialsSection',
  'bookingCTA',
] as const
export type SectionKey = (typeof ALL_SECTION_KEYS)[number]

export type HomePageData = {
  hero?: HeroSection
  featuredDepartments?: FeaturedDepartmentsSection
  trustStrip?: TrustStripSection
  allDepartments?: AllDepartmentsSection
  whyUs?: WhyUsSection
  testimonialsSection?: TestimonialsSection
  bookingCTA?: BookingCTASection
  sectionOrder?: SectionKey[] | null
}

/* ---------------- Department + Service (full data) ---------------- */

export type ServiceDoc = {
  _id: string
  slug?: { current: string } | null
  name?: LocalizedString | null
  description?: LocalizedText | null
  icon?: string | null
  image?: SanityImage
  price?: number | null
  showPrice?: boolean | null
  duration?: LocalizedString | null
  isPopular?: boolean | null
  order?: number | null
}

export type ServiceFull = ServiceDoc & {
  detailedDescription?: LocalizedRichText | null
  benefits?: LocalizedString[] | null
  preparation?: LocalizedRichText | null
  aftercare?: LocalizedRichText | null
  faqs?: FaqValue[] | null
  department?: {
    _id: string
    slug?: { current: string } | null
    name?: LocalizedString | null
    accentColor?: string | null
  } | null
}

export type DoctorDoc = {
  _id: string
  slug?: { current: string } | null
  name?: LocalizedString | null
  titlePrefix?: LocalizedString | null
  specialty?: LocalizedString | null
  yearsExperience?: number | null
  photo?: SanityImage
  gender?: 'male' | 'female' | null
  nationality?: string | null
  languages?: string[] | null
  displayOrder?: number | null
}

export type DoctorFull = {
  _id: string
  slug?: { current: string } | null
  name: LocalizedString
  titlePrefix: LocalizedString | null
  specialty: LocalizedString | null
  yearsExperience: number | null
  photo: SanityImage
  gender: 'male' | 'female' | null
  nationality: string | null
  languages: string[] | null
  bio?: LocalizedRichText | null
  qualifications?: LocalizedString[] | null
  workingDays?: string[] | null
  workingHours?: LocalizedString | null
  department?: {
    _id: string
    slug?: { current: string } | null
    name?: LocalizedString | null
    accentColor?: string | null
  } | null
}

export type BeforeAfterValue = {
  _key?: string
  treatment?: LocalizedString | null
  before?: SanityImage
  after?: SanityImage
  duration?: LocalizedString | null
}

export type EquipmentValue = {
  _key?: string
  name?: LocalizedString | null
  description?: LocalizedText | null
  image?: SanityImage
}

export type DepartmentFull = {
  _id: string
  slug?: { current: string } | null
  name?: LocalizedString | null
  tagline?: LocalizedString | null
  shortDescription?: LocalizedText | null
  fullDescription?: LocalizedRichText | null
  isFeatured?: boolean | null
  featuredOrder?: number | null
  displayOrder?: number | null
  isActive?: boolean | null
  icon?: string | null
  lottieFile?: { asset?: { url?: string } } | null
  coverImage?: SanityImage
  heroImage?: SanityImage
  gallery?: Array<{ _key?: string; asset?: unknown; alt?: string }> | null
  backgroundColor?: string | null
  accentColor?: string | null
  services?: ServiceDoc[] | null
  doctors?: DoctorDoc[] | null
  highlights?: LocalizedString[] | null
  faqs?: FaqValue[] | null
  beforeAfterImages?: BeforeAfterValue[] | null
  equipment?: EquipmentValue[] | null
  startingPrice?: number | null
  showStartingPrice?: boolean | null
  seo?: {
    title?: LocalizedString | null
    description?: LocalizedText | null
    keywords?: string[] | null
    ogImage?: SanityImage
    noIndex?: boolean | null
  } | null
}

/* ---------------- Directory + content document shapes ---------------- */

export type DoctorListItem = {
  _id: string
  slug?: { current: string } | null
  name: LocalizedString
  titlePrefix: LocalizedString | null
  specialty: LocalizedString | null
  yearsExperience: number | null
  photo: SanityImage
  gender: 'male' | 'female' | null
  nationality: string | null
  languages: string[] | null
  isAvailable: boolean | null
  isFeatured: boolean | null
  displayOrder: number | null
  department: {
    _id: string
    slug?: { current: string } | null
    name?: LocalizedString | null
  } | null
}

export type ArticleListItem = {
  _id: string
  title: LocalizedString
  slug: { ar?: { current: string } | null; en?: { current: string } | null } | null
  excerpt: LocalizedText | null
  featuredImage: SanityImage
  readTime: number | null
  publishedAt: string
  isFeatured: boolean | null
  category: {
    _id: string
    slug?: { current: string } | null
    name?: LocalizedString | null
  } | null
  author: {
    _id: string
    name?: LocalizedString | null
    titlePrefix?: LocalizedString | null
    photo?: SanityImage
  } | null
  authorOverride: LocalizedString | null
}

export type ArticleFull = ArticleListItem & {
  content: LocalizedRichText | null
  gallery: Array<{ _key?: string; asset?: unknown; alt?: string }> | null
  tags: string[] | null
  seo: {
    title?: LocalizedString | null
    description?: LocalizedText | null
    keywords?: string[] | null
    ogImage?: SanityImage
  } | null
}

export type TestimonialDoc = {
  _id: string
  patientName: LocalizedString
  patientInitial: string | null
  rating: number
  comment: LocalizedText
  date: string | null
  avatarColor: string | null
  isFeatured: boolean | null
  department: {
    _id: string
    slug?: { current: string } | null
    name?: LocalizedString | null
  } | null
  service: {
    _id: string
    name?: LocalizedString | null
  } | null
}

export type OfferDoc = {
  _id: string
  title: LocalizedString
  description: LocalizedText | null
  image: SanityImage
  badgeText: LocalizedString | null
  originalPrice: number | null
  offerPrice: number | null
  currency: string | null
  validFrom: string | null
  validUntil: string
  terms: LocalizedRichText | null
  maxBookings: number | null
  isFeatured: boolean | null
  department: {
    _id: string
    slug?: { current: string } | null
    name?: LocalizedString | null
  } | null
  service: {
    _id: string
    name?: LocalizedString | null
  } | null
}

export type CoverageRule = {
  _key?: string
  service: {
    _id: string
    name?: LocalizedString | null
    order?: number | null
    department?: {
      _id: string
      slug?: { current: string } | null
      name?: LocalizedString | null
      iconName?: string | null
      displayOrder?: number | null
    } | null
  } | null
  percentage: number
  requiresApproval: boolean | null
  notes: LocalizedText | null
}

export type InsuranceDoc = {
  _id: string
  name: LocalizedString
  shortLabel: string | null
  logo: SanityImage
  website: string | null
  brandColor: string | null
  coverageNote: LocalizedText | null
  isActive: boolean | null
  displayOrder: number | null
  coverageRules: CoverageRule[] | null
}

/* ---------------- Helpers ---------------- */

export function pickLocalized<T extends LocalizedString | LocalizedText>(
  value: T | null | undefined,
  locale: Locale,
): string | null {
  if (!value) return null
  return value[locale] || value[locale === 'ar' ? 'en' : 'ar'] || null
}
