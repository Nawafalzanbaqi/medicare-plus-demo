---
name: medicare-plus-medical-website
description: Master reference for building the MediCare Plus website. Contains strategy, design system, tech stack, libraries, icons, images, and bilingual (AR/EN) requirements. Claude Code must read this file before executing any task.
---

# Project Reference: MediCare Plus Website

> **Note for Claude Code:** Read this entire file before executing any task. All technical and design decisions in this file are binding. Do not invent colors, fonts, or libraries outside of what is defined here.

---

## 1. Project Background

**Client:** MediCare Plus (مركز ميديكير بلس الطبي) — Riyadh, Al-Olaya District
**Established:** 2010 (35+ years of experience)
**Primary Competitor:** Safa Al-Massi Clinics (founded 2021, same neighborhood)

### Strategic Goal

Increase demand for three underperforming departments by giving them visual and marketing prominence on the website:

- **Cosmetic Department** — must directly compete with Safa Al-Massi
- **Surgery Department** — a feature competing cosmetic clinics lack
- **Audiology Department** — a rare specialty positioning the complex as a unique choice

The remaining departments (Dental, Internal Medicine, Pediatrics, Gynecology, Orthopedics, Ophthalmology, Lab, Radiology) are performing well and should be displayed secondarily.

### Competitive Positioning Points

| Point | Application |
|---|---|
| 15 years of experience | Mentioned in Hero, Footer, About, every department page |
| Rare specialists (Audiology/Surgery) | Showcases diversity competitors don't offer |
| Certified medical staff | Displayed with accreditation badges (Joint Commission, SCFHS) |

---

## 2. Target Audience

- **Saudi men and women** aged 25-55, seeking trustworthy medical and cosmetic services
- **Senior citizens** (for audiology and internal medicine)
- **Mobile-first users** (use phones more than desktops) — Mobile-first design is mandatory
- **Prefer WhatsApp** over long forms — Every CTA opens WhatsApp

---

## 3. Bilingual Support (CRITICAL)

The website must fully support **Arabic (RTL)** and **English (LTR)**.

### i18n Strategy

- **Library:** `next-intl` (recommended for Next.js 15 App Router)
- **URL structure:** `/ar/...` (default) and `/en/...`
- **Locale detection:** Auto-detect from browser, with manual override
- **Direction switching:** Automatic `dir="rtl"` for Arabic, `dir="ltr"` for English
- **Language switcher:** Visible in TopBar and Footer
- **Translation files:** `src/messages/ar.json` and `src/messages/en.json`
- **Default locale:** Arabic (Saudi market)

### Translation Coverage

All UI text, content, metadata, alt texts, ARIA labels, and structured data must be translated. No hardcoded strings in components.

### Routing Setup

```
src/app/[locale]/
├── layout.tsx
├── page.tsx
├── departments/
├── about/
├── contact/
└── offers/

src/middleware.ts         # next-intl middleware
src/i18n/
├── request.ts            # next-intl config
└── routing.ts            # locale routing
src/messages/
├── ar.json
└── en.json
```

---

## 4. Tech Stack

| Category | Choice | Reason |
|---|---|---|
| Framework | **Next.js 15 (App Router)** | Excellent SEO, optimized images, Static Generation |
| Language | **TypeScript** | Type safety and code quality |
| Styling | **Tailwind CSS** (latest) | Speed, consistency, easy customization |
| Components | **shadcn/ui** | Ready-made, customizable components |
| i18n | **next-intl** | Best App Router i18n solution |
| Animations | **motion** (formerly Framer Motion) | Smooth React animations |
| Scroll Animations | **GSAP + ScrollTrigger** | Professional scroll effects |
| Smooth Scroll | **Lenis** | Premium feel scrolling |
| Forms | **React Hook Form + Zod** | Smart validation |
| Icons | **Lucide React** + **Phosphor Icons** | Modern, multiple weights |
| Medical Animations | **lottie-react** | Animated medical iconography |
| Carousel | **Embla Carousel** | Lightweight, responsive, RTL-aware |
| Notifications | **Sonner** | Elegant toast notifications |
| Utilities | **clsx + tailwind-merge** (cn) | Smart class merging |
| Hosting | **Vercel** | Instant deployment from GitHub |

### Installation Commands

```bash
# Create project
npx create-next-app@latest medicare-plus --typescript --tailwind --app --src-dir

# Core packages
npm i next-intl
npm i motion gsap lenis lottie-react embla-carousel-react embla-carousel-auto-scroll
npm i react-hook-form @hookform/resolvers zod
npm i lucide-react @phosphor-icons/react
npm i sonner
npm i clsx tailwind-merge

# shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button card input textarea label dialog sheet accordion select
```

---

## 5. Design System

### Color Palette

```css
/* CSS Variables - use everywhere */
--color-teal-deep: #0d3e3e;     /* Header, primary CTAs */
--color-teal: #1a5757;          /* Branches */
--color-teal-light: #2a7373;    /* Hovers, secondary backgrounds */
--color-gold: #c9a961;          /* Accent color */
--color-gold-soft: #e0c890;     /* Soft gold variant */
--color-cream: #f7f2e8;         /* Warm background */
--color-cream-light: #fbf8f0;   /* Main background */
--color-ink: #1a2424;           /* Primary text */
--color-muted: #6b7575;         /* Secondary text */
--color-line: rgba(13,62,62,0.12); /* Lines and dividers */
```

**Usage Rules:**

- ❌ Do NOT use traditional medical blue
- ❌ Do NOT use purple or pink gradients
- ✅ Petrol Teal as foundation with limited gold accents
- ✅ Gold for details only (less than 10% of the page)

### Typography (Bilingual)

```typescript
// Bilingual font setup using next/font
import { El_Messiri, IBM_Plex_Sans_Arabic, Cormorant_Garamond, IBM_Plex_Sans } from 'next/font/google'

// Arabic fonts
const displayAr = El_Messiri({
  subsets: ['arabic'],
  weight: ['500', '600', '700'],
  variable: '--font-display-ar',
})

const bodyAr = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body-ar',
})

// English fonts
const displayEn = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display-en',
})

const bodyEn = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-body-en',
})
```

**Rules:**

- **Arabic headings (h1-h3):** `El Messiri` — elegant and classical
- **Arabic body:** `IBM Plex Sans Arabic` — modern and readable
- **English headings (h1-h3):** `Cormorant Garamond` — elegant serif matching premium medical feel
- **English body:** `IBM Plex Sans` — clean and professional
- **Large numbers:** Display font weight 700
- ❌ Forbidden: Arial, Tahoma, Cairo (overused), Roboto, Inter

### Apply fonts based on locale

```css
html[lang="ar"] body { font-family: var(--font-body-ar); }
html[lang="ar"] h1, html[lang="ar"] h2, html[lang="ar"] h3 { font-family: var(--font-display-ar); }
html[lang="en"] body { font-family: var(--font-body-en); }
html[lang="en"] h1, html[lang="en"] h2, html[lang="en"] h3 { font-family: var(--font-display-en); }
```

### Sizing & Spacing

```css
/* Headings */
h1: clamp(2.2rem, 4.5vw, 3.6rem)  /* Page hero */
h2: 2.4rem - 2.6rem               /* Section title */
h3: 1.4rem - 1.6rem               /* Card title */
h4: 1.05rem                       /* Subtitle */
body: 1rem                        /* 16px main text */
small: 0.85rem                    /* Helper text */

/* Spacing scale */
section padding: 5rem - 6rem      /* Vertical */
container max-width: 1280px
gap-cards: 1.5rem - 2rem
border-radius: 12px (cards), 8px (buttons), 999px (pills)
```

### Shadows

```css
soft: 0 4px 14px rgba(13,62,62,0.08)
medium: 0 12px 30px rgba(13,62,62,0.12)
strong: 0 20px 50px rgba(13,62,62,0.15)
gold-glow: 0 0 30px rgba(201,169,97,0.3)
```

---

## 6. Icons

### Approved Libraries

| Library | Usage | Example |
|---|---|---|
| **Lucide React** | All general icons (UI, navigation, links) | `<Calendar />`, `<ArrowRight />` |
| **Phosphor Icons** (Duotone) | Large icons in feature cards | `<HeartbeatIcon weight="duotone" />` |
| **Lottie** | Animated icons for the three featured departments | `.json` files from LottieFiles |

### Featured Departments Icons (Lottie)

Search [lottiefiles.com](https://lottiefiles.com) for:

- **Cosmetic:** "beauty face", "skin care", "facial treatment"
- **Surgery:** "surgery", "medical operation", "scalpel"
- **Audiology:** "ear", "hearing aid", "sound waves"

Download the JSON file and save it in `/public/lottie/`

### Other Department Icons (Phosphor Duotone)

```typescript
import {
  ToothIcon,        // Dental
  StethoscopeIcon,  // Internal Medicine
  BabyIcon,         // Pediatrics
  FlowerIcon,       // Gynecology
  BoneIcon,         // Orthopedics
  EyeIcon,          // Ophthalmology
  FlaskIcon,        // Lab
  XRayIcon,         // Radiology
} from '@phosphor-icons/react'
```

### RTL Icon Considerations

- Arrow icons must flip direction in RTL mode
- Use Tailwind's `rtl:` modifier for directional flipping:

```tsx
<ArrowRight className="rtl:rotate-180" />
```

---

## 7. Images & Visual Assets

### Image Strategy for Prototype

| Type | Source | Search Term |
|---|---|---|
| Clinic exterior | Unsplash | "modern medical clinic interior" |
| Doctor with patient | Unsplash | "doctor patient consultation arabic" |
| Operating room | Unsplash | "modern operating room" |
| Hearing aids | Unsplash | "hearing aid technology" |
| Cosmetic treatments | Unsplash | "dermatology treatment" |
| Medical team | Unsplash | "saudi doctor team", "middle east medical staff" |
| Happy patients | Unsplash | "happy patient consultation" |

### Ready-to-Use Unsplash URLs (Prototype Only)

```
Main Hero:
https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=1600&q=80
(Doctor with patient - eye contact)

Cosmetic Department:
https://images.unsplash.com/photo-1614108213797-5793127a4ee2?w=800&q=80

Surgery Department:
https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&q=80

Audiology Department:
https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800&q=80

Interior:
https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1600&q=80
```

### For Production (After Approval)

- Professional photography of the complex (book a specialized photographer)
- Each doctor photographed on a uniform background
- Before/after images for cosmetic treatments (with patient consent)
- Short 30-second video for the Hero

### Image Handling

- Always use `next/image` for optimization
- `priority` for above-the-fold images
- `placeholder="blur"` for large images
- `loading="lazy"` for the rest
- All `alt` attributes must be translated via `useTranslations`

---

## 8. Project Structure

```
medicare-plus/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── layout.tsx              # Locale layout with fonts
│   │   │   ├── page.tsx                # Home page
│   │   │   ├── departments/
│   │   │   │   ├── cosmetic/page.tsx
│   │   │   │   ├── surgery/page.tsx
│   │   │   │   ├── audiology/page.tsx
│   │   │   │   └── [slug]/page.tsx     # Dynamic template
│   │   │   ├── about/page.tsx
│   │   │   ├── offers/page.tsx
│   │   │   └── contact/page.tsx
│   │   ├── globals.css                 # CSS variables and base styles
│   │   └── layout.tsx                  # Root layout (minimal)
│   ├── middleware.ts                   # next-intl middleware
│   ├── i18n/
│   │   ├── request.ts                  # next-intl config
│   │   └── routing.ts                  # Locale routing definition
│   ├── messages/
│   │   ├── ar.json                     # Arabic translations
│   │   └── en.json                     # English translations
│   ├── components/
│   │   ├── ui/                         # shadcn components
│   │   ├── layout/
│   │   │   ├── TopBar.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── LanguageSwitcher.tsx
│   │   │   └── WhatsAppFloat.tsx
│   │   ├── sections/
│   │   │   ├── Hero.tsx
│   │   │   ├── FeaturedDepartments.tsx # Key section!
│   │   │   ├── TrustStrip.tsx
│   │   │   ├── AllDepartments.tsx
│   │   │   ├── WhyUs.tsx
│   │   │   ├── Testimonials.tsx
│   │   │   └── BookingCTA.tsx
│   │   └── shared/
│   │       ├── SectionHeading.tsx
│   │       ├── AnimatedNumber.tsx
│   │       ├── LottieIcon.tsx
│   │       └── RevealOnScroll.tsx
│   ├── lib/
│   │   ├── utils.ts                    # cn helper
│   │   ├── data.ts                     # Department and doctor data
│   │   └── constants.ts                # Contact info, etc.
│   └── hooks/
│       ├── useLenis.ts
│       └── useReveal.ts
├── public/
│   ├── lottie/                         # Lottie files for departments
│   └── images/                         # Local images
├── tailwind.config.ts
└── next.config.mjs
```

---

## 9. Page Structure

### Home Page (Order is Mandatory)

1. **TopBar** — Operating hours + phone + language switcher
2. **Navbar** — Logo + menu + booking button
3. **Hero** — Message + 15 years + CTA + floating cards
4. **FeaturedDepartments** ⭐ — The 3 departments in a dark background with large space
5. **TrustStrip** — 4 quick trust points
6. **AllDepartments** — Grid of remaining departments (smaller treatment)
7. **WhyUs** — Why MediCare + large stat (35)
8. **Testimonials** — Carousel of patient reviews
9. **BookingCTA** — Prominent booking section
10. **Footer** — All links and contact info

### Department Page (e.g., Cosmetic)

1. Department Hero — Image + department message
2. Services within the department — Detailed grid
3. Medical team — Doctor cards
4. Before/After (cosmetic) or Equipment (audiology/surgery)
5. Current offers
6. FAQ
7. Booking CTA

---

## 10. Animations

### General Rules

- ✅ **Easing:** `cubic-bezier(0.65, 0, 0.35, 1)` or motion presets
- ✅ **Duration:** 0.4s - 0.8s for main animations, 0.2s for hovers
- ✅ **Stagger:** 0.1s delay between sequential elements
- ❌ Don't overdo it to the point of distraction

### Required Animations

| Location | Animation |
|---|---|
| Page load | Hero text + visual enter from sides with stagger |
| Featured Departments | Each card enters with scale + opacity + sequential delay |
| Numbers (35, 50+) | Animated counter from 0 to value on scroll |
| Cards | hover: translateY(-8px) + soft gold glow |
| Buttons | hover: scale(1.02) + deeper shadow |
| Images | reveal with clip-path on scroll |
| Lottie icons | Auto-play + soft loop |
| Scroll | Lenis for smoothness, GSAP ScrollTrigger for effects |

---

## 11. RTL & Internationalization

### CSS Direction Handling

Direction is set automatically by next-intl based on locale. Use logical properties:

- Use `inset-inline-start` instead of `left`, `inset-inline-end` instead of `right`
- Use `ms-*` and `me-*` (margin-start/end) in Tailwind
- Tailwind v3+ has `rtl:` and `ltr:` modifiers — use them for direction-specific styles
- Test every breakpoint in both directions
- Numbers and dates: use locale-aware formatting (`Intl.NumberFormat`, `Intl.DateTimeFormat`)
- Phone numbers always LTR even in Arabic content — wrap with `dir="ltr"`

### Common RTL Pitfalls

- Carousels: configure Embla with `direction: 'rtl'` when locale is Arabic
- Form inputs: text-align should follow content direction
- Icons inside buttons: use `rtl:flex-row-reverse` when icon position matters
- Box shadows: usually fine, but check directional ones

---

## 12. SEO & Metadata

### Per-Page Meta Tags

Each page exports `generateMetadata` returning translated content:

- `title`: "Page Name | MediCare Plus" — translated
- `description`: 150-160 characters, descriptive, translated
- `og:image`: 1200×630px with logo and title
- `lang` and `dir` set automatically via locale layout
- `alternates.languages` to declare both versions for search engines

### Structured Data (Schema.org)

- `MedicalBusiness` for the site
- `MedicalSpecialty` for each department
- `Person` for each doctor
- `Review` for testimonials
- Include `inLanguage` property

---

## 13. Performance Targets

- Lighthouse Performance: > 90
- LCP < 2.5s
- CLS < 0.1
- Bundle size: < 200KB initial JS
- Images optimized in AVIF/WebP via `next/image`

---

## 14. Mandatory Rules for Claude Code

1. ✅ Read this entire file before any task
2. ✅ Stick to the design system 100% — no colors or fonts outside what's defined
3. ✅ All UI strings must come from translation files — NO hardcoded text
4. ✅ Every primary CTA → WhatsApp (instead of form)
5. ✅ Mobile-first for every component
6. ✅ Strict TypeScript — no `any`
7. ✅ Reusable components (DRY)
8. ✅ Code in English, comments in English
9. ❌ Don't use emoji instead of real icons
10. ❌ Don't invent content — use data in `lib/data.ts` and translation files
11. ✅ Both Arabic and English versions must look polished — don't treat English as an afterthought

---

## 15. Ready-to-Use Data

### Contact Information

```typescript
// src/lib/constants.ts
export const CONTACT = {
  phone: '+966500000000',
  whatsapp: '966500000000',
  email: 'info@medicare-plus-demo.vercel.app',
  social: {
    instagram: '@carenahdah',
    snapchat: 'carenahdah',
  }
}

export const LOCALES = ['ar', 'en'] as const
export const DEFAULT_LOCALE = 'ar' as const
```

### Featured Departments

```typescript
// src/lib/data.ts
export const FEATURED_DEPARTMENTS = [
  {
    slug: 'cosmetic',
    translationKey: 'cosmetic',
    lottie: '/lottie/cosmetic.json',
    image: '/images/cosmetic.jpg',
  },
  {
    slug: 'surgery',
    translationKey: 'surgery',
    lottie: '/lottie/surgery.json',
    image: '/images/surgery.jpg',
  },
  {
    slug: 'audiology',
    translationKey: 'audiology',
    lottie: '/lottie/audiology.json',
    image: '/images/audiology.jpg',
  }
]
```

### Translation File: messages/ar.json

```json
{
  "common": {
    "bookAppointment": "احجز موعدك",
    "learnMore": "اعرف المزيد",
    "callUs": "اتصل بنا",
    "whatsapp": "احجز عبر واتساب",
    "exploreDepartment": "اكتشف القسم"
  },
  "nav": {
    "home": "الرئيسية",
    "departments": "الأقسام",
    "about": "عن المجمع",
    "offers": "العروض",
    "contact": "اتصل بنا"
  },
  "topBar": {
    "hours": "مفتوح اليوم: 9 صباحاً - 11 مساءً"
  },
  "hero": {
    "badge": "خبرة 15 سنة في خدمة الرياض",
    "title": "رعاية طبية متكاملة بلمسة <em>راقية</em> وخبرة عريقة",
    "description": "من قسم التجميل والجراحة إلى السمعيات وعشرات التخصصات الأخرى — نقدّم لكم رعاية صحية شاملة بمعايير عالمية، تحت إشراف نخبة من الأطباء والاستشاريين.",
    "stats": {
      "years": "سنة من الخبرة",
      "departments": "قسم متخصص",
      "doctors": "طبيب واستشاري",
      "rating": "تقييم المراجعين"
    },
    "floatingCard": {
      "title": "تخصصات فريدة في الرياض",
      "description": "قسم السمعيات وأجهزة السمع، الجراحة المتقدمة، والتجميل غير الجراحي — كلها تحت سقف واحد.",
      "tag": "جديد للعام 2026"
    }
  },
  "featuredDepartments": {
    "eyebrow": "أقسامنا المميّزة",
    "title": "تخصصات نتفرّد بها",
    "description": "ثلاثة أقسام أساسية تعكس تطوّر ميديكير بلس وتوسّعه — بأحدث الأجهزة وأمهر الكفاءات.",
    "cosmetic": {
      "name": "قسم التجميل",
      "tagline": "نتائج طبيعية بأيدي خبرة 15 سنة",
      "description": "تجميل غير جراحي بأحدث التقنيات — فيلر، بوتكس، ليزر، وعلاجات البشرة المتقدمة، تحت إشراف استشاريين معتمدين.",
      "services": [
        "فيلر وبوتكس بأنواعه",
        "ليزر إزالة الشعر وتفتيح البشرة",
        "علاجات النضارة والشد",
        "تنظيف البشرة العميق"
      ]
    },
    "surgery": {
      "name": "قسم الجراحة",
      "tagline": "عمليات دقيقة بفريق طبي عريق",
      "description": "وحدة جراحية متكاملة بأحدث غرف العمليات وأمهر الجراحين المعتمدين — جراحة عامة، تجميلية، ودقيقة.",
      "services": [
        "جراحة عامة وتجميلية",
        "غرف عمليات مجهزة بالكامل",
        "متابعة ما بعد العملية",
        "تأمين على معظم الشبكات"
      ]
    },
    "audiology": {
      "name": "قسم السمعيات",
      "tagline": "المتخصصون في صحة السمع في الرياض",
      "description": "تشخيص دقيق لاضطرابات السمع، وتركيب وضبط أجهزة السمع بأحدث التقنيات العالمية، لجميع الأعمار.",
      "services": [
        "فحوصات السمع الشاملة",
        "تركيب وضبط أجهزة السمع",
        "استشارات لكبار السن والأطفال",
        "صيانة ومتابعة دورية"
      ]
    }
  },
  "trustStrip": {
    "quickBooking": { "title": "حجز سريع", "description": "أقل من دقيقة عبر الواتساب" },
    "equipment": { "title": "أحدث الأجهزة", "description": "تقنيات طبية معتمدة عالمياً" },
    "staff": { "title": "كادر متخصص", "description": "استشاريون وأخصائيون معتمدون" },
    "insurance": { "title": "شبكات التأمين", "description": "قبول معظم شركات التأمين" }
  },
  "allDepartments": {
    "eyebrow": "جميع الأقسام",
    "title": "تخصصات أخرى لخدمتك",
    "dental": { "name": "طب الأسنان", "description": "تنظيف، تقويم، تركيبات" },
    "internal": { "name": "الباطنية", "description": "تشخيص وعلاج شامل" },
    "pediatrics": { "name": "الأطفال", "description": "متابعة النمو والتطعيمات" },
    "gynecology": { "name": "النساء والولادة", "description": "عناية متكاملة بصحة المرأة" },
    "orthopedics": { "name": "العظام", "description": "إصابات ومفاصل" },
    "ophthalmology": { "name": "العيون", "description": "فحص ونظارات وعلاج" },
    "lab": { "name": "المختبر", "description": "تحاليل شاملة بدقة" },
    "radiology": { "name": "الأشعة", "description": "تصوير تشخيصي حديث" }
  },
  "whyUs": {
    "eyebrow": "لماذا ميديكير بلس",
    "title": "إرث طبي يمتد لأكثر من ثلاثة عقود",
    "description": "منذ عام 2010 ونحن نقدّم رعاية طبية موثوقة لآلاف العائلات في الرياض.",
    "features": {
      "experience": { "title": "خبرة تراكمية لا تُضاهى", "description": "15 سنة من العمل الطبي المتواصل" },
      "staff": { "title": "كادر طبي معتمد", "description": "استشاريون حاصلون على شهادات عالمية" },
      "equipment": { "title": "تجهيزات حديثة", "description": "استثمار مستمر في أحدث الأجهزة" },
      "experience2": { "title": "تجربة مراجع مريحة", "description": "حجز سريع وخدمة عملاء متجاوبة" }
    }
  },
  "bookingCta": {
    "eyebrow": "احجز موعدك",
    "title": "تجربة طبية تبدأ <em>بمكالمة واحدة</em>",
    "description": "فريقنا جاهز للرد على استفسارك وحجز موعدك في القسم المناسب — خلال دقائق."
  },
  "footer": {
    "description": "مجمع طبي متكامل في الرياض — حي العليا، نقدّم خدمات صحية شاملة بمعايير عالية الجودة منذ أكثر من ثلاثة عقود.",
    "featuredDepts": "الأقسام المميّزة",
    "quickLinks": "روابط سريعة",
    "contactUs": "تواصل معنا",
    "address": "الرياض - حي العليا",
    "rights": "© 2026 مركز ميديكير بلس الطبي — جميع الحقوق محفوظة"
  }
}
```

### Translation File: messages/en.json

```json
{
  "common": {
    "bookAppointment": "Book Appointment",
    "learnMore": "Learn More",
    "callUs": "Call Us",
    "whatsapp": "Book via WhatsApp",
    "exploreDepartment": "Explore Department"
  },
  "nav": {
    "home": "Home",
    "departments": "Departments",
    "about": "About",
    "offers": "Offers",
    "contact": "Contact"
  },
  "topBar": {
    "hours": "Open Today: 9 AM - 11 PM"
  },
  "hero": {
    "badge": "15 Years Serving Riyadh",
    "title": "Comprehensive Medical Care with a <em>Refined</em> Touch and Lasting Expertise",
    "description": "From Cosmetic and Surgery to Audiology and dozens of other specialties — we provide comprehensive healthcare with international standards under the supervision of elite doctors and consultants.",
    "stats": {
      "years": "Years of Experience",
      "departments": "Specialized Departments",
      "doctors": "Doctors & Consultants",
      "rating": "Patient Rating"
    },
    "floatingCard": {
      "title": "Unique Specialties in Riyadh",
      "description": "Audiology, advanced surgery, and non-surgical cosmetics — all under one roof.",
      "tag": "New for 2026"
    }
  },
  "featuredDepartments": {
    "eyebrow": "Our Featured Departments",
    "title": "Specialties That Set Us Apart",
    "description": "Three core departments reflecting MediCare's growth and evolution — with the latest equipment and most skilled professionals.",
    "cosmetic": {
      "name": "Cosmetic Department",
      "tagline": "Natural Results from 15 Years of Expertise",
      "description": "Non-surgical cosmetic treatments with the latest technologies — fillers, botox, laser, and advanced skin treatments under certified consultants.",
      "services": [
        "Filler & Botox treatments",
        "Laser hair removal and skin brightening",
        "Skin revitalization and tightening",
        "Deep skin cleansing"
      ]
    },
    "surgery": {
      "name": "Surgery Department",
      "tagline": "Precision Procedures by an Experienced Surgical Team",
      "description": "A complete surgical unit with state-of-the-art operating rooms and the most skilled certified surgeons — general, cosmetic, and precision surgery.",
      "services": [
        "General and cosmetic surgery",
        "Fully equipped operating rooms",
        "Post-operative care",
        "Most insurance networks accepted"
      ]
    },
    "audiology": {
      "name": "Audiology Department",
      "tagline": "Hearing Health Specialists in Riyadh",
      "description": "Accurate diagnosis of hearing disorders, hearing aid fitting and tuning with the latest global technologies — for all ages.",
      "services": [
        "Comprehensive hearing tests",
        "Hearing aid fitting and tuning",
        "Consultations for seniors and children",
        "Maintenance and regular follow-up"
      ]
    }
  },
  "trustStrip": {
    "quickBooking": { "title": "Quick Booking", "description": "Less than a minute via WhatsApp" },
    "equipment": { "title": "Latest Equipment", "description": "Internationally certified medical technologies" },
    "staff": { "title": "Specialized Staff", "description": "Certified consultants and specialists" },
    "insurance": { "title": "Insurance Networks", "description": "Most insurance companies accepted" }
  },
  "allDepartments": {
    "eyebrow": "All Departments",
    "title": "Other Specialties at Your Service",
    "dental": { "name": "Dental", "description": "Cleaning, orthodontics, prosthetics" },
    "internal": { "name": "Internal Medicine", "description": "Comprehensive diagnosis and treatment" },
    "pediatrics": { "name": "Pediatrics", "description": "Growth monitoring and vaccinations" },
    "gynecology": { "name": "Gynecology & Obstetrics", "description": "Integrated women's health care" },
    "orthopedics": { "name": "Orthopedics", "description": "Injuries and joints" },
    "ophthalmology": { "name": "Ophthalmology", "description": "Exams, glasses, treatment" },
    "lab": { "name": "Laboratory", "description": "Comprehensive accurate analyses" },
    "radiology": { "name": "Radiology", "description": "Modern diagnostic imaging" }
  },
  "whyUs": {
    "eyebrow": "Why MediCare",
    "title": "A Medical Legacy Spanning Over Three Decades",
    "description": "Since 2010, we have been providing trusted medical care to thousands of families in Riyadh.",
    "features": {
      "experience": { "title": "Unmatched Cumulative Experience", "description": "15 years of continuous medical work" },
      "staff": { "title": "Certified Medical Staff", "description": "Consultants with international certifications" },
      "equipment": { "title": "Modern Equipment", "description": "Continuous investment in the latest devices" },
      "experience2": { "title": "Comfortable Patient Experience", "description": "Quick booking and responsive customer service" }
    }
  },
  "bookingCta": {
    "eyebrow": "Book Your Appointment",
    "title": "A Medical Experience That Starts with <em>One Call</em>",
    "description": "Our team is ready to answer your inquiry and book your appointment in the right department — within minutes."
  },
  "footer": {
    "description": "An integrated medical complex in Riyadh — Al-Olaya District. We provide comprehensive health services with high quality standards for over three decades.",
    "featuredDepts": "Featured Departments",
    "quickLinks": "Quick Links",
    "contactUs": "Contact Us",
    "address": "Riyadh - Al-Olaya District",
    "rights": "© 2026 MediCare Plus — All rights reserved"
  }
}
```
