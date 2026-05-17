/**
 * Static lookup tables and TYPE definitions only.
 *
 * Editable content (doctor profiles, testimonials, department descriptions,
 * service lists, gallery images, etc.) is owned by Sanity Studio (/studio)
 * and must NEVER be hardcoded here. The arrays exported below contain only:
 *   - slug ↔ icon/translation-key maps (UI plumbing)
 *   - empty arrays that act as zero-content fallbacks when Sanity is
 *     unreachable, so the site never crashes while showing no stale data
 */

export type DepartmentSlug =
  | 'cosmetic'
  | 'surgery'
  | 'audiology'
  | 'dental'
  | 'internal'
  | 'pediatrics'
  | 'gynecology'
  | 'orthopedics'
  | 'ophthalmology'
  | 'lab'
  | 'radiology'

export type FeaturedSlug = 'cosmetic' | 'surgery' | 'audiology'

export type FeaturedDepartment = {
  slug: FeaturedSlug
  translationKey: FeaturedSlug
  lottie: string
}

/** Plumbing for the home page featured-departments section. Imagery comes from Sanity. */
export const FEATURED_DEPARTMENTS: FeaturedDepartment[] = [
  { slug: 'cosmetic', translationKey: 'cosmetic', lottie: '/lottie/cosmetic.json' },
  { slug: 'surgery', translationKey: 'surgery', lottie: '/lottie/surgery.json' },
  { slug: 'audiology', translationKey: 'audiology', lottie: '/lottie/audiology.json' },
]

export type DoctorLanguage = 'ar' | 'en' | 'fr' | 'ur'
export type DoctorNationality = 'sa' | 'eg' | 'jo' | 'sd' | 'in' | 'pk'
export type DoctorGender = 'male' | 'female'

export type Doctor = {
  id: string
  /** Public slug used to link to /doctors/[slug]. Optional — when missing, the card stays in non-link mode. */
  slug?: string | null
  name: { ar: string; en: string }
  title: { ar: string; en: string }
  specialty: { ar: string; en: string }
  yearsExperience: number
  /** Sanity CDN URL, or empty string to render the SafeImage placeholder. */
  photo: string
  department: DepartmentSlug
  gender: DoctorGender
  nationality: DoctorNationality
  languages: DoctorLanguage[]
}

/** Doctor roster lives in Sanity. Empty zero-state — never seed sample data here. */
export const DOCTORS: Doctor[] = []

export type Department = {
  slug: DepartmentSlug
  translationKey: string
  featured: boolean
  iconName: string
}

export type Testimonial = {
  id: string
  name: { ar: string; en: string }
  comment: { ar: string; en: string }
  departmentSlug: DepartmentSlug
  rating: 4 | 5
}

/** Patient stories live in Sanity. Empty zero-state. */
export const TESTIMONIALS: Testimonial[] = []

/** Department slugs + icon names for the all-departments grid. Names/descriptions come from CMS. */
export const ALL_DEPARTMENTS: Department[] = [
  { slug: 'cosmetic', translationKey: 'featuredDepartments.cosmetic', featured: true, iconName: 'sparkle' },
  { slug: 'surgery', translationKey: 'featuredDepartments.surgery', featured: true, iconName: 'first-aid' },
  { slug: 'audiology', translationKey: 'featuredDepartments.audiology', featured: true, iconName: 'ear' },
  { slug: 'dental', translationKey: 'allDepartments.dental', featured: false, iconName: 'tooth' },
  { slug: 'internal', translationKey: 'allDepartments.internal', featured: false, iconName: 'stethoscope' },
  { slug: 'pediatrics', translationKey: 'allDepartments.pediatrics', featured: false, iconName: 'baby' },
  { slug: 'gynecology', translationKey: 'allDepartments.gynecology', featured: false, iconName: 'flower' },
  { slug: 'orthopedics', translationKey: 'allDepartments.orthopedics', featured: false, iconName: 'bone' },
  { slug: 'ophthalmology', translationKey: 'allDepartments.ophthalmology', featured: false, iconName: 'eye' },
  { slug: 'lab', translationKey: 'allDepartments.lab', featured: false, iconName: 'flask' },
  { slug: 'radiology', translationKey: 'allDepartments.radiology', featured: false, iconName: 'x-ray' },
]
