/**
 * MediCare Plus — Sanity seed script.
 *
 * Populates an empty Sanity dataset with realistic bilingual sample data
 * (Arabic + English) so the booking flow, department pages, and doctor
 * filters work for the portfolio demo.
 *
 * Run with:  npm run seed
 *
 * Re-runnable: each document uses a deterministic _id so subsequent runs
 * upsert via createOrReplace rather than producing duplicates.
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { randomBytes } from 'node:crypto'

// --------------------------------------------------------------------------
// Env loading (.env.local)
// --------------------------------------------------------------------------

function loadEnv(path: string): void {
  try {
    const raw = readFileSync(path, 'utf8')
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      let value = trimmed.slice(eq + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      if (!(key in process.env)) process.env[key] = value
    }
  } catch (err) {
    console.error(`⚠️  Could not read ${path}:`, (err as Error).message)
  }
}

loadEnv(resolve(process.cwd(), '.env.local'))

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01'
const token = process.env.SANITY_API_READ_TOKEN

if (!projectId) {
  console.error('❌ Missing NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local')
  process.exit(1)
}
if (!token) {
  console.error('❌ Missing SANITY_API_READ_TOKEN in .env.local (needs write permission)')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
})

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

const key = () => randomBytes(6).toString('hex')

type Bilingual = { ar: string; en: string }

/** Build a localizedRichText PortableText array for a single paragraph. */
function richText(text: string) {
  return [
    {
      _type: 'block',
      _key: key(),
      style: 'normal',
      markDefs: [],
      children: [{ _type: 'span', _key: key(), text, marks: [] }],
    },
  ]
}

/** Fetch a placehold.co image and upload it to Sanity. Returns image ref or null on failure. */
async function uploadImageFromUrl(url: string, filename: string) {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buf = Buffer.from(await res.arrayBuffer())
    const contentType = res.headers.get('content-type') || 'image/png'
    const asset = await client.assets.upload('image', buf, { filename, contentType })
    return { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }
  } catch (err) {
    console.warn(`⚠️  Image upload failed for ${filename}: ${(err as Error).message}`)
    return null
  }
}

const createdCount = { ok: 0, fail: 0 }

async function upsert(doc: Record<string, unknown> & { _id: string; _type: string }, label: string) {
  try {
    await client.createOrReplace(doc)
    createdCount.ok++
    console.log(`✅ Created ${doc._type}: ${label}`)
  } catch (err) {
    createdCount.fail++
    console.error(`❌ Failed ${doc._type} (${label}):`, (err as Error).message)
  }
}

// --------------------------------------------------------------------------
// Source data
// --------------------------------------------------------------------------

type DepartmentSeed = {
  slug: string
  name: Bilingual
  description: Bilingual
  icon: string
  featured: boolean
  cover: string
}

const departments: DepartmentSeed[] = [
  {
    slug: 'cardiology',
    name: { ar: 'طب القلب', en: 'Cardiology' },
    description: {
      ar: 'متخصصون في تشخيص وعلاج أمراض القلب',
      en: 'Diagnosis and treatment of heart diseases',
    },
    icon: 'heart',
    featured: true,
    cover: 'https://placehold.co/800x600/0d3e3e/ffffff?text=Cardiology',
  },
  {
    slug: 'surgery',
    name: { ar: 'الجراحة', en: 'Surgery' },
    description: {
      ar: 'جراحات عامة وتخصصية بأحدث التقنيات',
      en: 'General and specialized surgery with latest techniques',
    },
    icon: 'first-aid',
    featured: true,
    cover: 'https://placehold.co/800x600/0d3e3e/ffffff?text=Surgery',
  },
  {
    slug: 'cosmetics',
    name: { ar: 'التجميل', en: 'Cosmetics' },
    description: {
      ar: 'إجراءات تجميلية آمنة وطبيعية',
      en: 'Safe and natural cosmetic procedures',
    },
    icon: 'sparkle',
    featured: true,
    cover: 'https://placehold.co/800x600/0d3e3e/ffffff?text=Cosmetics',
  },
  {
    slug: 'audiology',
    name: { ar: 'السمعيات', en: 'Audiology' },
    description: {
      ar: 'اختبار السمع والأجهزة السمعية الحديثة',
      en: 'Hearing testing and modern hearing aids',
    },
    icon: 'ear',
    featured: true,
    cover: 'https://placehold.co/800x600/0d3e3e/ffffff?text=Audiology',
  },
  {
    slug: 'orthopedics',
    name: { ar: 'العظام', en: 'Orthopedics' },
    description: {
      ar: 'علاج إصابات وأمراض العظام والمفاصل',
      en: 'Treatment of bone and joint injuries',
    },
    icon: 'bone',
    featured: false,
    cover: 'https://placehold.co/800x600/1a5757/ffffff?text=Orthopedics',
  },
  {
    slug: 'dermatology',
    name: { ar: 'الجلدية', en: 'Dermatology' },
    description: {
      ar: 'علاج أمراض الجلد والتجميل الطبي',
      en: 'Skin disease treatment and medical aesthetics',
    },
    icon: 'leaf',
    featured: false,
    cover: 'https://placehold.co/800x600/1a5757/ffffff?text=Dermatology',
  },
]

type DoctorSeed = {
  slug: string
  name: Bilingual
  specialty: Bilingual
  experience: number
  bio: Bilingual
  image: string
  departmentSlug: string
  gender: 'male' | 'female'
}

const doctors: DoctorSeed[] = [
  {
    slug: 'dr-ahmed-mohammed',
    name: { ar: 'أحمد محمد', en: 'Ahmed Mohammed' },
    specialty: { ar: 'طب القلب', en: 'Cardiology' },
    experience: 12,
    bio: {
      ar: 'استشاري طب القلب مع خبرة 12 سنة في تشخيص وعلاج أمراض القلب والشرايين.',
      en: 'Cardiologist with 12 years of experience in diagnosing and treating heart and arterial diseases.',
    },
    image: 'https://placehold.co/400x500/2E75B6/FFFFFF?text=Dr+Ahmed',
    departmentSlug: 'cardiology',
    gender: 'male',
  },
  {
    slug: 'dr-sarah-ali',
    name: { ar: 'سارة علي', en: 'Sarah Ali' },
    specialty: { ar: 'الجراحة', en: 'Surgery' },
    experience: 15,
    bio: {
      ar: 'استشارية جراحة عامة وتخصصية مع خبرة 15 سنة في غرف العمليات الحديثة.',
      en: 'General and specialized surgery consultant with 15 years of experience in modern operating rooms.',
    },
    image: 'https://placehold.co/400x500/2E75B6/FFFFFF?text=Dr+Sarah',
    departmentSlug: 'surgery',
    gender: 'female',
  },
  {
    slug: 'dr-mohammed-khalid',
    name: { ar: 'محمد خالد', en: 'Mohammed Khalid' },
    specialty: { ar: 'السمعيات', en: 'Audiology' },
    experience: 10,
    bio: {
      ar: 'متخصص في اختبار وعلاج السمع وتركيب وضبط أجهزة السمع لجميع الأعمار.',
      en: 'Specialist in hearing testing, treatment, and fitting of hearing aids for all ages.',
    },
    image: 'https://placehold.co/400x500/2E75B6/FFFFFF?text=Dr+Khalid',
    departmentSlug: 'audiology',
    gender: 'male',
  },
  {
    slug: 'dr-noor-hassan',
    name: { ar: 'نور حسن', en: 'Noor Hassan' },
    specialty: { ar: 'التجميل', en: 'Cosmetics' },
    experience: 8,
    bio: {
      ar: 'استشارية إجراءات تجميلية آمنة وفعالة بأحدث التقنيات غير الجراحية.',
      en: 'Consultant for safe and effective cosmetic procedures using the latest non-surgical techniques.',
    },
    image: 'https://placehold.co/400x500/2E75B6/FFFFFF?text=Dr+Noor',
    departmentSlug: 'cosmetics',
    gender: 'female',
  },
]

type ServiceSeed = {
  slug: string
  title: Bilingual
  price: number
  durationMin: number
  departmentSlug?: string
}

const services: ServiceSeed[] = [
  // -------------------------------- CARDIOLOGY
  {
    slug: 'full-checkup',
    title: { ar: 'فحص شامل', en: 'Full Check-up' },
    price: 200,
    durationMin: 30,
    departmentSlug: 'cardiology',
  },
  {
    slug: 'consultation',
    title: { ar: 'استشارة', en: 'Consultation' },
    price: 100,
    durationMin: 20,
    departmentSlug: 'cardiology',
  },
  {
    slug: 'follow-up',
    title: { ar: 'متابعة', en: 'Follow-up' },
    price: 75,
    durationMin: 15,
    departmentSlug: 'cardiology',
  },
  {
    slug: 'ecg',
    title: { ar: 'تخطيط القلب', en: 'ECG' },
    price: 200,
    durationMin: 25,
    departmentSlug: 'cardiology',
  },
  {
    slug: 'ultrasound',
    title: { ar: 'الموجات فوق الصوتية', en: 'Ultrasound' },
    price: 300,
    durationMin: 30,
    departmentSlug: 'cardiology',
  },

  // -------------------------------- SURGERY
  {
    slug: 'surgery-service',
    title: { ar: 'جراحة', en: 'Surgery' },
    price: 2000,
    durationMin: 120,
    departmentSlug: 'surgery',
  },
  {
    slug: 'treatment',
    title: { ar: 'علاج', en: 'Treatment' },
    price: 300,
    durationMin: 45,
    departmentSlug: 'surgery',
  },
  {
    slug: 'general-surgery',
    title: { ar: 'جراحة عامة', en: 'General Surgery' },
    price: 3000,
    durationMin: 150,
    departmentSlug: 'surgery',
  },
  {
    slug: 'anesthesia',
    title: { ar: 'تخدير', en: 'Anesthesia' },
    price: 500,
    durationMin: 45,
    departmentSlug: 'surgery',
  },

  // -------------------------------- COSMETICS
  {
    slug: 'cosmetic-injection',
    title: { ar: 'حقنة تجميلية', en: 'Cosmetic Injection' },
    price: 500,
    durationMin: 20,
    departmentSlug: 'cosmetics',
  },
  {
    slug: 'facial-cleaning',
    title: { ar: 'تنظيف بشرة', en: 'Facial Cleaning' },
    price: 150,
    durationMin: 45,
    departmentSlug: 'cosmetics',
  },
  {
    slug: 'hair-removal-laser',
    title: { ar: 'ليزر إزالة الشعر', en: 'Hair Removal Laser' },
    price: 800,
    durationMin: 60,
    departmentSlug: 'cosmetics',
  },
  {
    slug: 'chemical-peel',
    title: { ar: 'تقشير كيميائي', en: 'Chemical Peel' },
    price: 350,
    durationMin: 40,
    departmentSlug: 'cosmetics',
  },

  // -------------------------------- AUDIOLOGY
  {
    slug: 'hearing-test',
    title: { ar: 'فحص الأذن', en: 'Hearing Test' },
    price: 150,
    durationMin: 30,
    departmentSlug: 'audiology',
  },
  {
    slug: 'hearing-aid-programming',
    title: { ar: 'برمجة سماعة الأذن', en: 'Hearing Aid Programming' },
    price: 250,
    durationMin: 45,
    departmentSlug: 'audiology',
  },
  {
    slug: 'ear-cleaning',
    title: { ar: 'تنظيف الأذن', en: 'Ear Cleaning' },
    price: 100,
    durationMin: 20,
    departmentSlug: 'audiology',
  },

  // -------------------------------- ORTHOPEDICS
  {
    slug: 'rehabilitation',
    title: { ar: 'إعادة تأهيل', en: 'Rehabilitation' },
    price: 250,
    durationMin: 60,
    departmentSlug: 'orthopedics',
  },
]

type OfferSeed = {
  slug: string
  title: Bilingual
  discountPercent: number
  validFrom: string
  validTo: string
  serviceSlug?: string
  departmentSlug?: string
}

const offers: OfferSeed[] = [
  {
    slug: 'surgery-package',
    title: { ar: 'عرض الجراحة', en: 'Surgery Package' },
    discountPercent: 20,
    validFrom: '2024-01-01',
    validTo: '2026-12-31',
    serviceSlug: 'surgery-service',
    departmentSlug: 'surgery',
  },
  {
    slug: 'free-consultation',
    title: { ar: 'استشارة مجانية', en: 'Free Consultation' },
    discountPercent: 100,
    validFrom: '2024-01-01',
    validTo: '2026-12-31',
    serviceSlug: 'consultation',
  },
  {
    slug: 'cosmetics-special',
    title: { ar: 'عرض التجميل', en: 'Cosmetics Special' },
    discountPercent: 15,
    validFrom: '2024-01-01',
    validTo: '2026-12-31',
    serviceSlug: 'cosmetic-injection',
    departmentSlug: 'cosmetics',
  },
]

// --------------------------------------------------------------------------
// Seed
// --------------------------------------------------------------------------

const id = (type: string, slug: string) => `seed.${type}.${slug}`

async function seedDepartments() {
  console.log('\n🏥 Seeding departments…')
  await Promise.all(
    departments.map(async (d, i) => {
      const cover = await uploadImageFromUrl(d.cover, `dept-${d.slug}.png`)
      await upsert(
        {
          _id: id('department', d.slug),
          _type: 'department',
          slug: { _type: 'slug', current: d.slug },
          name: d.name,
          shortDescription: d.description,
          fullDescription: { ar: richText(d.description.ar), en: richText(d.description.en) },
          icon: d.icon,
          isFeatured: d.featured,
          featuredOrder: d.featured ? i + 1 : 100,
          displayOrder: i + 1,
          isActive: true,
          ...(cover ? { coverImage: cover } : {}),
        },
        d.name.en,
      )
    }),
  )
}

async function seedDoctors() {
  console.log('\n👩‍⚕️ Seeding doctors…')
  await Promise.all(
    doctors.map(async (doc, i) => {
      const photo = await uploadImageFromUrl(doc.image, `doctor-${doc.slug}.png`)
      await upsert(
        {
          _id: id('doctor', doc.slug),
          _type: 'doctor',
          slug: { _type: 'slug', current: doc.slug },
          name: doc.name,
          titlePrefix: { ar: 'د.', en: 'Dr.' },
          specialty: doc.specialty,
          department: { _type: 'reference', _ref: id('department', doc.departmentSlug) },
          gender: doc.gender,
          languages: ['ar', 'en'],
          yearsExperience: doc.experience,
          bio: { ar: richText(doc.bio.ar), en: richText(doc.bio.en) },
          workingDays: ['sun', 'mon', 'tue', 'wed', 'thu'],
          workingHours: { ar: '10 صباحاً - 6 مساءً', en: '10 AM – 6 PM' },
          isAvailable: true,
          isFeatured: true,
          displayOrder: i + 1,
          ...(photo ? { photo } : {}),
        },
        `Dr. ${doc.name.en}`,
      )
    }),
  )
}

async function seedServices() {
  console.log('\n🩺 Seeding services…')
  await Promise.all(
    services.map(async (s, i) => {
      await upsert(
        {
          _id: id('service', s.slug),
          _type: 'service',
          slug: { _type: 'slug', current: s.slug },
          name: s.title,
          description: {
            ar: `${s.title.ar} بمدة ${s.durationMin} دقيقة.`,
            en: `${s.title.en} in ${s.durationMin} minutes.`,
          },
          price: s.price,
          showPrice: true,
          duration: { ar: `${s.durationMin} دقيقة`, en: `${s.durationMin} minutes` },
          order: i + 1,
          ...(s.departmentSlug
            ? {
                department: {
                  _type: 'reference',
                  _ref: id('department', s.departmentSlug),
                },
              }
            : {}),
        },
        s.title.en,
      )
    }),
  )
}

async function seedOffers() {
  console.log('\n🎁 Seeding offers…')
  await Promise.all(
    offers.map(async (o) => {
      const linkedService = o.serviceSlug
        ? services.find((s) => s.slug === o.serviceSlug)
        : undefined
      const originalPrice = linkedService?.price ?? 0
      const offerPrice = Math.round(originalPrice * (1 - o.discountPercent / 100))

      await upsert(
        {
          _id: id('offer', o.slug),
          _type: 'offer',
          title: o.title,
          description: {
            ar: `${o.title.ar} بخصم ${o.discountPercent}%`,
            en: `${o.title.en} with ${o.discountPercent}% off`,
          },
          originalPrice,
          offerPrice,
          currency: 'SAR',
          badgeText: {
            ar: o.discountPercent === 100 ? 'مجاناً' : `خصم ${o.discountPercent}%`,
            en: o.discountPercent === 100 ? 'Free' : `${o.discountPercent}% off`,
          },
          validFrom: new Date(o.validFrom).toISOString(),
          validUntil: new Date(o.validTo).toISOString(),
          isActive: true,
          isFeatured: true,
          ...(o.serviceSlug
            ? { service: { _type: 'reference', _ref: id('service', o.serviceSlug) } }
            : {}),
          ...(o.departmentSlug
            ? {
                department: {
                  _type: 'reference',
                  _ref: id('department', o.departmentSlug),
                },
              }
            : {}),
        },
        o.title.en,
      )
    }),
  )
}

async function main() {
  console.log(`🌱 Seeding Sanity dataset "${dataset}" on project ${projectId}…`)
  const started = Date.now()

  // Departments must come first so doctors/services/offers can reference them.
  await seedDepartments()
  await seedDoctors()
  await seedServices()
  await seedOffers()

  const elapsed = ((Date.now() - started) / 1000).toFixed(1)
  console.log(
    `\n✨ Seed completed! ${createdCount.ok} documents created` +
      (createdCount.fail ? `, ${createdCount.fail} failed` : '') +
      ` in ${elapsed}s.`,
  )

  if (createdCount.fail > 0) process.exitCode = 1
}

main().catch((err) => {
  console.error('❌ Seed crashed:', err)
  process.exit(1)
})
