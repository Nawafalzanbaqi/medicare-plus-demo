# Studio-as-Single-Source-of-Truth Audit

Date: 2026-05-17
Scope: Make `/studio` (Sanity Studio) the only place where content is edited;
remove hardcoded fallbacks, broken external imagery, and dead code; verify
the live site renders graceful placeholders instead of crashing when a CMS
field is empty.

`npm run build` — **zero warnings, zero errors**.

---

## A. Sanity-Controlled Content

Every element a non-developer can edit lives in Sanity Studio. UI labels
(navigation, buttons, ARIA strings) remain in `src/messages/{ar,en}.json` so
translators control them.

### Layout

| Element | Sanity field | Where it renders |
|---|---|---|
| Brand logo / favicon | `siteSettings.logo`, `siteSettings.favicon` | Navbar, Footer, browser tab |
| Working hours text | `siteSettings.workingHours.{ar,en}` | TopBar, Footer, Contact page |
| Phone / WhatsApp / Email | `siteSettings.phone` / `whatsapp` / `email` | TopBar, Navbar CTA, Footer, Contact, BookingCTA |
| Postal address | `siteSettings.address.{ar,en}` | Footer, Contact page |
| Social handles | `siteSettings.socialLinks.*` | Footer icons |
| Year established | `siteSettings.yearEstablished` | About page badge |
| Primary / accent colors | `siteSettings.primaryColor` / `accentColor` | Future theming overrides |
| TopBar visibility / colors | `topBar.*` | TopBar |
| Footer description / background / columns / badges / copyright | `footer.*` | Footer |

### Home Page

| Element | Sanity field | Where it renders |
|---|---|---|
| Section order | `homePage.sectionOrder[]` | Whole home page |
| Hero badge | `homePage.hero.badge.{ar,en}` | Hero pill above title |
| Hero title (rich text w/ gold em) | `homePage.hero.title.{ar,en}` | Hero `<h1>` |
| Hero description | `homePage.hero.description.{ar,en}` | Hero subhead |
| Hero primary / secondary CTA | `homePage.hero.primaryCTA`, `secondaryCTA` | Hero buttons |
| Hero stats (up to 5) | `homePage.hero.stats[]` | Hero stat strip |
| Hero image | `homePage.hero.heroImage` | Hero visual column |
| Hero floating cards (up to 3) | `homePage.hero.floatingCards[]` | Hero overlay cards |
| Hero background style / custom bg | `homePage.hero.backgroundStyle`, `customBackground` | Hero background |
| Featured Departments title block | `homePage.featuredDepartments.eyebrow/title/description` | Section header |
| Featured Departments list (refs) | `homePage.featuredDepartments.departments[]` | The 3 dark cards |
| Trust Strip items (up to 4) | `homePage.trustStrip.items[]` | TrustStrip row |
| All Departments title | `homePage.allDepartments.eyebrow/title` | Section header |
| All Departments list (refs) | `homePage.allDepartments.departments[]` | Secondary grid |
| Why Us title block | `homePage.whyUs.eyebrow/title/description` | Section header |
| Why Us features | `homePage.whyUs.features[]` | Bullet list |
| Counter year-start | `homePage.whyUs.counterStartYear` | YearCounter |
| Why Us badges | `homePage.whyUs.badges[]` | (reserved — render-ready) |
| Testimonials title block | `homePage.testimonialsSection.eyebrow/title/description` | Section header |
| Auto-scroll testimonials | `homePage.testimonialsSection.autoScroll` | Embla AutoScroll plugin |
| Booking CTA title block | `homePage.bookingCTA.eyebrow/title/description` | Section copy |
| Booking CTA buttons | `homePage.bookingCTA.whatsappButton`, `phoneButton` | Section buttons |
| Booking CTA background image | `homePage.bookingCTA.backgroundImage` | Section background |

### Department Pages (per slug)

| Element | Sanity field | Where it renders |
|---|---|---|
| Slug | `department.slug.current` | URL `/departments/[slug]` |
| Name (AR/EN) | `department.name` | Hero, breadcrumb, JSON-LD |
| Tagline | `department.tagline` | Hero, section headings |
| Short description | `department.shortDescription` | Hero subhead, meta |
| Hero image | `department.heroImage` | Department Hero |
| Highlights row | `department.highlights[]` | Strip under Hero |
| Accent color | `department.accentColor` | Highlight dots, price card border |
| Services (refs) | `department.services[]` → `service.*` | Services grid |
| Doctors (refs) | `department.doctors[]` → `doctor.*` | Team grid |
| FAQs | `department.faqs[]` | FAQ accordion |
| Before/After pairs | `department.beforeAfterImages[]` | Real-Results slider (cosmetic) or gallery |
| Equipment items | `department.equipment[]` | Equipment showcase |
| Starting price + flag | `department.startingPrice`, `showStartingPrice` | Price card |
| Per-page SEO | `department.seo.*` | (consumed via `seoFields`) |

### Doctors Directory

| Element | Sanity field |
|---|---|
| Photo, name, specialty, years experience, languages, gender, nationality | `doctor.*` |
| Availability filter | `doctor.isAvailable` (excluded if false) |

### Blog

| Element | Sanity field |
|---|---|
| Title, excerpt, tags, read time, publish date | `article.*` |
| Bilingual slug | `article.slug.{ar,en}.current` |
| Featured image, gallery | `article.featuredImage`, `gallery[]` |
| Author (ref) or override | `article.author` → `doctor.*` or `article.authorOverride` |
| Category (ref) | `article.category` → `department.*` |
| Body (Portable Text) | `article.content.{ar,en}` |
| Visibility | `article.isPublished` |

### Testimonials

| Element | Sanity field |
|---|---|
| Patient name, comment, rating | `testimonial.*` |
| Department / service (refs) | `testimonial.department`, `service` |
| Avatar color | `testimonial.avatarColor` |
| Approval (moderation) | `testimonial.isApproved` (only `true` reaches the site) |

### Offers

| Element | Sanity field |
|---|---|
| Title, description, image, prices, currency, badge text | `offer.*` |
| Validity dates | `offer.validFrom`, `validUntil` (auto-expires) |
| Active flag | `offer.isActive` |

### Insurance

| Element | Sanity field |
|---|---|
| Provider name, logo, brand color, website | `insurance.*` |
| Coverage rules per service | `insurance.coverageRules[]` |
| Active flag, display order | `insurance.isActive`, `displayOrder` |

---

## B. Fixed Issues

### Deprecations
- `@sanity/image-url` default-export deprecation **resolved** in
  `src/sanity/lib/image.ts` — now imports the named `createImageUrlBuilder`.
- No other deprecated Sanity imports were found.

### Broken external image URLs (404s)
Removed every Unsplash and `i.pravatar.cc` URL the site had been pointing at:
- `src/lib/data.ts` — stripped Unsplash photos from `FEATURED_DEPARTMENTS`
  (no more `heroImage` field) and reset `DOCTORS`/`TESTIMONIALS` to empty
  arrays. Doctor profiles are now CMS-only.
- `src/messages/ar.json`, `src/messages/en.json` — removed
  `departments.cosmetic.gallery[]`, `departments.surgery.equipment[]`,
  `departments.audiology.equipment[]` (all carried Unsplash URLs).
- `src/components/sections/Hero.tsx` — removed `FALLBACK_HERO_IMAGE` Unsplash.
- `src/app/[locale]/departments/[slug]/page.tsx` — removed
  `REAL_RESULTS_IMAGES` array of Unsplash photos and the Unsplash hero
  fallback.
- `src/app/[locale]/blog/page.tsx` and
  `src/app/[locale]/blog/[slug]/page.tsx` — removed Unsplash fallback
  used when an article lacked a `featuredImage`.
- `next.config.ts` — `images.remotePatterns` now allows only
  `cdn.sanity.io`. Any future `next/image` usage with a non-Sanity URL
  will fail loudly instead of silently 404'ing.

### Dead/duplicate content removed
- All hardcoded doctor names/photos in `src/lib/data.ts` (the `DOCTORS`
  array previously held 18 fake profiles with Unsplash/Pravatar avatars).
- All hardcoded testimonials in `src/lib/data.ts`.
- The `image` and `heroImage` lookups from `ALL_DEPARTMENTS` /
  `FEATURED_DEPARTMENTS` (the components no longer need them; imagery
  comes from Sanity references).
- Department-page imagery JSON inside `messages/*.json` (gallery + equipment
  blocks).

### Routes added
- `/[locale]/about` — page was linked in Navbar/Footer but did not exist
  (404). Now renders a Sanity-aware About page with values, story, and
  CTA. Content comes from `messages.about.*` + `siteSettings.yearEstablished`.
- `/[locale]/contact` — same situation. Now renders a real Contact page
  pulling phone/email/address/hours from Sanity (`siteSettings`) with
  WhatsApp/phone/email/address/hours cards.
- `/api/revalidate` — on-demand Sanity webhook handler.

### Cache strategy hardened
- Every CMS query in `src/sanity/lib/queries.ts` already tags its result
  (`siteSettings`, `topBar`, `footer`, `homePage`, `department`,
  `department:<slug>`, `doctor`, `article`, `article:<slug>`,
  `testimonial`, `offer`, `insurance`).
- Default ISR window: 60s (`sanityFetch({revalidate: 60})`).
- **New:** `src/app/api/revalidate/route.ts` accepts a POST from a Sanity
  webhook and immediately purges the matching tag via Next 16's
  `revalidateTag(tag, { expire: 0 })`. Per-document tags are purged for
  `department` and `article` updates so a single doc change refreshes
  exactly that page.
- Webhook auth: `SANITY_WEBHOOK_SECRET` header check. Skipped only when
  the env var is unset (dev convenience).

---

## C. Created Fallbacks

A new shared component, **`src/components/shared/SafeImage.tsx`**, renders
a styled placeholder whenever an image is `null`, empty, or missing:
- Teal gradient (teal-deep → teal-light)
- Gold Phosphor `Image` icon (duotone)
- Locale-aware caption ("صورة قريباً" / "Image coming soon")
- Honors caller's aspect ratio (`square`, `video`, `4/3`, `16/10`, `3/4`, or `auto`)
- Marks the placeholder with `role="img"` + `aria-label` so screen readers
  read the original alt text

`SafeImage` is now used by:
- `Hero.tsx` (main hero image)
- `DepartmentHero.tsx` (department hero image)
- `DoctorCard.tsx` (doctor avatar)
- `DoctorsDirectory.tsx` (directory card avatar)
- `EquipmentShowcase.tsx` (equipment photo)
- `BeforeAfterGallery.tsx` (before/after pair)
- `ArticleCard.tsx` (blog list thumbnail)
- `app/[locale]/blog/[slug]/page.tsx` (article hero)
- `app/[locale]/offers/page.tsx` (offer card image)

When the corresponding Sanity image is empty, the layout no longer breaks
or 404s — the caller sees a branded placeholder instead.

---

## D. Verified Routes

`next build` produced these routes; every one is statically generated or
dynamically renderable, every page either fetches from Sanity (`getXxx`
helpers in `src/sanity/lib/queries.ts`) or shows a CMS-aware fallback,
and every page exports `generateMetadata`:

| Route | Generation | Sanity source |
|---|---|---|
| `/[locale]` | SSG | `getHomePage`, `getApprovedTestimonials` |
| `/[locale]/about` | SSG | `getSiteSettings` |
| `/[locale]/blog` | SSG | `getArticles` (+ MDX fallback) |
| `/[locale]/blog/[slug]` | SSG (10 paths) | `getArticleBySlug` (+ MDX fallback) |
| `/[locale]/contact` | SSG | `getSiteSettings` |
| `/[locale]/departments` | SSG | `getAllDepartments` |
| `/[locale]/departments/[slug]` | SSG (22 paths) | `getDepartmentBySlug` |
| `/[locale]/doctors` | SSG | `getDoctors` |
| `/[locale]/insurance` | SSG | (insurance calc is client-side, but `getActiveInsurance` ready) |
| `/[locale]/offers` | SSG | `getActiveOffers` |
| `/api/draft-mode/enable` | Dynamic | n/a |
| `/api/draft-mode/disable` | Dynamic | n/a |
| `/api/revalidate` | Dynamic | tag purge |
| `/studio/[[...index]]` | Dynamic | embedded Studio |

ISR window: 1m, expire 1y — perfectly compatible with on-demand tag
purges from the new webhook.

The proxy (Next 16 middleware) at `src/proxy.ts` already excludes
`/studio` and `/api` so locale prefixing doesn't break Studio or the
revalidate endpoint.

---

## E. Outstanding Items

1. **Sanity Studio webhook configuration** — the route is live, but a
   developer must go to `sanity.io/manage` and add a webhook:
   - URL: `https://your-domain.vercel.app/api/revalidate`
   - HTTP method: POST
   - Trigger on: Create, Update, Delete
   - Filter: leave empty (we accept all `_type`s and ignore unknown)
   - Headers: `x-sanity-signature: <SANITY_WEBHOOK_SECRET>`
   Add `SANITY_WEBHOOK_SECRET=<same-value>` to Vercel environment vars.

2. **Lottie files** — `LOTTIE_AVAILABLE` is still `false` in
   `FeaturedDepartments.tsx`. Once the client uploads
   `/public/lottie/cosmetic.json`, `/public/lottie/surgery.json`,
   `/public/lottie/audiology.json`, flip the flag to `true`.

3. **Real photography** — the placeholder ships everywhere Sanity images
   are empty (which is most of them, since the dataset is still being
   seeded). For launch, the client must:
   - Upload `homePage.hero.heroImage`
   - For each department: `coverImage`, `heroImage`
   - For each doctor: `photo`
   - For each service/offer with a price: optional `image`
   - For each before/after pair: `before` + `after`
   - For each equipment item: `image`

4. **Blog MDX fallback** — `src/content/blog/{ar,en}/*.mdx` and the
   `lib/blog.ts` loader are still active as a fallback layer. Once all
   posts exist in Sanity, the MDX files and `lib/blog.ts` can be deleted
   in a follow-up cleanup. They are not currently in the way.

5. **Insurance calculator data** — the calculator at
   `src/components/insurance/InsuranceCalculator.tsx` still reads from
   `src/lib/insurance-data.ts` (hardcoded providers + coverage matrix).
   Sanity already has matching schemas (`insurance.coverageRules[]`); a
   follow-up should rewrite the calculator to query
   `getActiveInsurance()`. Kept for this audit because the calculator is
   functional and changing it is a substantial behavioural change beyond
   "remove broken images".

6. **Schemas with no current renderer** — `siteSettings.defaultSEO`,
   `homePage.seo`, `department.seo.*`, `footer.bottomBadges[]`,
   `whyUs.badges[]`, `department.gallery[]`,
   `siteSettings.primaryColor`/`accentColor`,
   `siteSettings.isMaintenanceMode`. These fields exist in Studio and
   accept content but the front-end does not yet consume them. They are
   intentional next-iteration hooks — not orphan fields — and are listed
   here so future work knows where to wire them up.

7. **Sanity TypeScript regen** — `src/sanity/types.ts` is hand-written.
   Once the project is bound to a real Sanity dataset, run
   `npx sanity@latest typegen generate` and replace the file with the
   generated `sanity.types.ts`.

---

## F. Recent Fixes (2026-05-17 — Studio preview + service / doctor detail pages)

### F.1 Sanity Studio preview errors eliminated
Every preview was rewritten to select the full `localizedString` /
`localizedText` object and extract `.ar` / `.en` inside `prepare`, instead
of selecting deep paths (`name.ar`, `tagline.ar`, …). The recurring
console error `"The 'title' field should be a string, …, instead saw
object with keys {_type, ar, en}"` is gone.

Schemas updated (every preview now follows the safe pattern):

| File | Change |
|---|---|
| `objects/seoFields.ts` | **Added missing preview** (its `title` field is a localizedString — was the root cause) |
| `documents/department.ts` | preview selects `name` + `tagline` objects |
| `documents/doctor.ts` | preview selects `name` + `specialty` objects; **added `slug` field** |
| `documents/service.ts` | preview selects `name` + `department.name`; **added `slug`, `detailedDescription`, `benefits`, `preparation`, `aftercare`, `faqs`** |
| `documents/article.ts` | preview selects `title` object |
| `documents/testimonial.ts` | preview selects `patientName` object |
| `documents/offer.ts` | preview selects `title` object |
| `documents/insurance.ts` | doc preview + nested `coverageRule.preview` rewritten |
| `objects/card.ts` | preview selects `title` + `description` objects |
| `objects/button.ts` | preview selects `label` object |
| `objects/faq.ts` | preview selects `question` + `answer` objects |
| `objects/beforeAfterPair.ts` | preview selects `treatment` + `duration` objects |
| `objects/equipmentItem.ts` | preview selects `name` + `description` objects |
| `objects/statItem.ts` | preview selects `label` object |
| `singletons/homePage.ts` | inline `trustItem` + `whyUsFeature` previews |
| `singletons/footer.ts` | inline `footerColumn` + `footerLink` previews |
| `singletons/siteSettings.ts` | preview selects `siteName` object |

### F.2 New routes
| Route | Generation | Source |
|---|---|---|
| `/[locale]/services/[slug]` | SSG | `getServiceBySlug` + `getAllServiceSlugs` |
| `/[locale]/doctors/[slug]` | SSG | `getDoctorBySlug` + `getAllDoctorSlugs` |

Each detail page renders: hero (image, title, badges, CTAs), department
breadcrumb back-link, rich-text body (Portable Text), related lists,
empty-state fallbacks, and a WhatsApp CTA with service/doctor name
baked into the pre-filled message.

### F.3 Cards now properly linked

| Card | Behavior |
|---|---|
| `ServiceCard` (department + service pages) | Whole card wraps `<Link href="/services/[slug]">` when slug present |
| `DoctorCard` (department pages) | Name wraps `<Link href="/doctors/[slug]">` when slug present |
| `DoctorDirectoryCard` (`/doctors`) | Name + secondary "Profile" link to `/doctors/[slug]` |
| `ArticleCard` (verified) | Already linked `/blog/[slug]` |
| `OfferCard` (verified) | Already opens WhatsApp directly |
| Department cards (home + `/departments`) (verified) | Already linked `/departments/[slug]` |

### F.4 Department page polished
- Rebuilt services section with: centered `SectionHeader`, responsive
  grid that **collapses to a centered flex row when fewer than 3 cards
  exist** (cards stay at `max-width: 360px`, the row centers).
- "More services coming soon" hint added below sparse grids
  (`services.length < 3`).
- New shared **`EmptyState`** component renders a branded placeholder
  (gold icon box + title + description + optional WhatsApp CTA) for
  every section that may be empty: services, doctors, gallery,
  equipment, FAQs. The page never "breaks" or shows large blank
  whitespace when CMS data is sparse.
- All section headers now use the shared **`SectionHeader`**
  (eyebrow → h2 → optional description, centered, max-width 600px).

### F.5 New schemas/fields added to Service
- `slug` (required)
- `detailedDescription` (localizedRichText) — long-form details
- `benefits` (array of localizedString) — bullet points
- `preparation` (localizedRichText) — what to do before
- `aftercare` (localizedRichText) — what to do after
- `faqs` (array of `faq` objects) — service-specific FAQs

### F.6 New field added to Doctor
- `slug` (required) — enables `/[locale]/doctors/[slug]` routing

### F.7 New shared components
- `src/components/shared/SectionHeader.tsx`
- `src/components/shared/EmptyState.tsx`

### F.8 New translation keys
`messages/{ar,en}.json`:
- `departments.common.servicesEyebrow`, `moreServicesSoon`, `popular`,
  `currency`, `empty.*` (services/doctors/gallery/equipment/faq titles
  + descriptions + `contactCta`)
- `services.*` (metaTitle/Description, hero.bookCTA, hero.callCTA,
  durationLabel, priceLabel, departmentLabel, benefits, preparation,
  aftercare, relatedDoctors, relatedServices, faqs.title, cta.*,
  whatsappPrefix, breadcrumb*)
- `doctorDetail.*` (breadcrumb*, experienceLabel, languagesLabel,
  qualificationsLabel, scheduleLabel, workingHoursLabel, departmentLabel,
  bookButton, callButton, bioHeading, days.*)

### F.9 Build verification
`npm run build` — **zero errors, zero warnings** with new routes
present in the manifest:
- 22 paths for `/[locale]/departments/[slug]`
- `/[locale]/services/[slug]` (SSG, count depends on dataset)
- `/[locale]/doctors/[slug]` (SSG, count depends on dataset)

---

## F.10 Sprint 1 — Conversion UX (2026-05-17)

Three additions aimed at lifting booking conversion across every page.

### F.10.1 Trust Bar (sticky, below Navbar, desktop only)

- New singleton schema `trustBar` (`src/sanity/schemas/singletons/trustBar.ts`)
  with `isVisible`, `items[]` (up to 5: icon name + localized text + optional
  link), `backgroundColor`, `textColor` (both use the brand swatch input).
- Studio shows it under "⚙️ الإعدادات العامة → شريط الثقة".
- Webhook `revalidate` route accepts `_type: 'trustBar'` and purges
  the `trustBar` cache tag.
- New query helper `getTrustBar()` in `src/sanity/lib/queries.ts`,
  tagged `['trustBar']`.
- New component `src/components/layout/TrustBar.tsx` — Server Component:
  - Renders below the Navbar (`<TopBar /> → <Navbar /> → <TrustBar />`).
  - Hidden on mobile via `hidden md:block`.
  - When `isVisible === false` → returns `null`.
  - When `items[]` is empty → falls back to **5 default items** from
    translations (`trustBar.defaults.{rating,certified,insurance,hours,experience}`).
  - Phosphor duotone icons via a `kebab-case → component` map
    (`star`, `hospital`, `credit-card`, `phone`, `trophy`, …).
  - Items separated by **gold dot bullets**.
  - 36-px height, centered content, deep-cream background, border-top + bottom.

### F.10.2 Quick Booking Bar (sticky floating widget)

- New component `src/components/booking/QuickBookingBar.tsx` —
  Client Component using `motion/react` + `phosphor-icons`:
  - Collapsed state: a 56-px pill in the bottom-end corner showing a
    pulsing calendar icon + "احجز موعدك" / "Book Appointment".
  - Expanded state: a 380-px-wide card with a teal-deep header,
    Department → Service → Time-slot pills (Morning / Evening / Any)
    → optional name + phone collapsible → big WhatsApp button.
  - **Hidden on `/studio`** routes (path denylist).
  - **Hidden when scrolled into the footer** — uses
    `IntersectionObserver` on the page `<footer>` element.
  - **Doesn't overlap WhatsAppFloat** — WhatsAppFloat sits on
    `inset-inline-start`, QuickBookingBar sits on `inset-inline-end`,
    so they live on opposite sides in both LTR and RTL.
  - Persists "dismissed" choice in `sessionStorage` (`qbb:dismissed`).
    Expansion is NOT auto-restored on every page view — the user has to
    click the pill again.
  - WhatsApp message is built with full context (department name in the
    active locale, service name, time slot, name, phone).
  - Optimistic UI: "جاري الفتح…" / "Opening…" between submit-click and
    actual `wa.me` redirect (200 ms).
- New public API: `GET /api/booking-options` returns
  `{ departments: [{ _id, slug, name, services: [...] }] }`
  for the client dropdowns. Cached with ISR (60 s) + the `department`
  tag — same purge rules as everything else.

### F.10.3 Skeleton screens + loading.tsx files

- New shared skeleton library at
  `src/components/shared/skeletons/`:
  - `Skeleton.tsx` — primitive that adds the `nahda-skeleton` class.
  - `TextSkeleton.tsx` — variable-line text placeholder.
  - `CardSkeleton.tsx` — generic card placeholder (configurable image
    aspect ratio).
  - `GridSkeleton.tsx` — wraps `CardSkeleton` in the same responsive
    grid the listing pages use.
  - `HeroSkeleton.tsx` — large image + heading + 2 buttons.
  - `index.ts` — re-exports.
- Shimmer animation lives in `src/app/globals.css` as `.nahda-skeleton`
  (1.5 s ease-in-out gradient sweep). The keyframes flip direction
  for `html[dir="rtl"]` so the sheen moves the natural way for the
  active locale. `@media (prefers-reduced-motion: reduce)` disables
  the animation.
- Loading states wired to these routes:
  - `app/[locale]/loading.tsx` → `<HeroSkeleton />`
  - `app/[locale]/departments/loading.tsx` → heading skeleton + 9-card grid
  - `app/[locale]/departments/[slug]/loading.tsx` → hero skeleton + section heading + 6-card grid
  - `app/[locale]/doctors/loading.tsx` → heading + 8 square cards
  - `app/[locale]/blog/loading.tsx` → heading + 6 article cards
  - `app/[locale]/offers/loading.tsx` → heading + 6 offer cards

### F.10.4 Translation keys added

`messages/{ar,en}.json`:
- `trustBar.ariaLabel`
- `trustBar.defaults.{rating,certified,insurance,hours,experience}`
- `quickBooking.{cta,openLabel,title,close,departmentLabel,departmentPlaceholder,serviceLabel,servicePlaceholder,noServices,timeLabel,contactToggle,namePlaceholder,phonePlaceholder,submit,sending,dismiss}`
- `quickBooking.slots.{morning,evening,any}`
- `quickBooking.whatsapp.{greeting,departmentLabel,serviceLabel,timeLabel,nameLabel,phoneLabel}`

### F.10.5 Manual seed steps for the developer

1. **trustBar singleton** — go to Studio → `⚙️ الإعدادات العامة → شريط الثقة`.
   The five default items already ship via translations, so you can leave
   `items[]` empty and the bar will use them. Override only when you
   want different content.
2. **Sanity webhook** — already filters by `_type`. Trigger fires for
   `trustBar` document changes (mapping added to
   `src/app/api/revalidate/route.ts`). No re-configuration needed in
   sanity.io/manage.
3. **No content seeding required for QuickBookingBar** — it reads
   `departments` + `services` already in the CMS.
4. **Lottie / photography** — still outstanding from Section E (no
   regression here).

---

## F.12 Sprint 2 — Booking flow, BookButton, smart WhatsApp (2026-05-17)

Front-end overhaul focused on a single end-to-end booking experience and
context-rich WhatsApp messages everywhere they fire.

### F.12.1 New `/[locale]/book` 3-step wizard

- New route `app/[locale]/book/page.tsx` (dynamic — accepts
  `?department`, `?service`, `?support` query params).
- New client component `src/components/booking/BookingFlow.tsx`:
  - **Step 1 — Department** — responsive grid (1/2/3 cols), Phosphor
    duotone icons, accent-color ring, click auto-advances.
  - **Step 2 — Service** — grid of services for the picked department,
    with price + duration meta. Includes a graceful empty state +
    "Skip to contact" path when the department has zero services.
  - **Step 3 — Time + Personal Info** — morning / evening / any pills,
    optional name + phone + notes, big WhatsApp submit.
  - **Progress indicator** — gold dots with motion scale + ring on the
    current step, fill between completed steps.
  - **Smart skipping** — initial step is computed from query params:
    no params → Step 1, `?department=` → Step 2, `?department=&service=` →
    Step 3.
  - **AnimatePresence slide transitions** — 0.4s ease, direction flips
    for RTL.
  - **URL sync** — selections propagate back to the URL via
    `router.replace`, so refresh / share preserves progress.
  - Focus moves to the step heading on every transition for screen
    readers.

### F.12.2 ServiceCard single-Book pattern

`src/components/department/ServiceCard.tsx` rewritten:

- Removed the "اعرف المزيد" / "Learn More" link with arrow.
- Card body (icon, title, description, meta) wraps a `<Link>` to
  `/services/[slug]` — clicking anywhere on the body opens the detail
  page.
- A new bottom `<BookButton>` ("احجز هذه الخدمة" / "Book This Service")
  navigates to `/book?department=[dept]&service=[svc]` and calls
  `e.stopPropagation()` so it doesn't trigger the card's body link.
- The new button sits outside the `<Link>` (avoids the invalid
  `<a><button></a>` HTML pattern that nested links would create).
- Service detail page hero CTA + bottom CTA now route to the booking
  flow as well, keeping a single, consistent path to WhatsApp.

### F.12.3 Reusable `BookButton`

New `src/components/shared/BookButton.tsx`:

- Two modes:
  - Default → next-intl `<Link>`, internal navigation, calendar icon
    that rotates 6° on hover. Used by ServiceCards.
  - `external={true}` → plain `<a target="_blank">`, WhatsApp icon. Used
    by DoctorCard and OfferCard to open `wa.me/...` directly.
- Three sizes (`sm`/`md`/`lg`), two variants (`primary` teal-deep /
  `soft` gold), optional `stopPropagation`, scale-1.02 on hover, full
  RTL handling via Tailwind logical classes.

Applied to: ServiceCard, DoctorCard, OfferCard, and the offers-page
empty-state CTA.

### F.12.4 Comprehensive WhatsApp message builder

`src/lib/whatsapp.ts` rewritten as a typed dispatcher:

- New rich `WhatsAppContextRich` type with discriminator `type:
  'booking' | 'inquiry' | 'support' | 'offer' | 'doctor-inquiry' |
  'general'`. Each branch builds a multi-line, emoji-prefixed Arabic or
  English message with **smart field omission** (no orphan
  "الاسم: " lines).
- Legacy `{locale, page, service?}` calls still work — they get adapted
  to the rich form by `buildLegacyMessage` so older call sites don't
  break.
- New helper `getBookingFlowUrl({departmentSlug, serviceSlug, ...})`
  returns a locale-agnostic `/book?...` path, suitable for next-intl
  `<Link>`.

WhatsApp triggers updated to use the new context system (12 surfaces
total):

| # | Surface | Type | Notes |
|---|---|---|---|
| 1 | `WhatsAppFloat` (bottom-left) | `inquiry` / `general` | `general` w/ department context on department landings, else `inquiry`. |
| 2 | Hero primary CTA | `booking` (via legacy adapter) | Honours Sanity-configured CTA. |
| 3 | `BookingCTA` section WhatsApp | `booking` | Honours CMS override. |
| 4 | Department page empty-state CTA | `booking` (legacy) | When services/doctors/faqs are empty. |
| 5 | ServiceCard "احجز هذه الخدمة" | → `/book` flow | Opens booking flow, no direct WhatsApp. |
| 6 | Service detail hero "Book CTA" | → `/book` flow | Pre-fills department + service. |
| 7 | Service detail bottom CTA | → `/book` flow | Same pre-fill. |
| 8 | Doctor cards (department page) | `doctor-inquiry` | Includes doctor name + specialty. |
| 9 | Doctors directory cards (`/doctors`) | `doctor-inquiry` | Same as above. |
| 10 | Doctor detail page CTAs | `doctor-inquiry` | Includes department too. |
| 11 | Offer cards | `offer` | Title + offerPrice + originalPrice + currency. |
| 12 | Offers empty-state CTA | `inquiry` | Generic. |
| 13 | Contact page WhatsApp + cards | `inquiry` (legacy `page='contact'` → adapter). |
| 14 | Insurance calculator final step | `inquiry` | Includes provider + service + coverage in the `notes` field. |
| 15 | Blog article share-on-WhatsApp | `general` | Carries the share template in `notes`. |
| 16 | QuickBookingBar submit | `booking` | Full context (dept, service, time, name, phone). |
| 17 | BookingFlow Step 3 submit | `booking` / `support` | Full context. |

No more hand-built `https://wa.me/${CONTACT.whatsapp}?text=...` strings
exist in `src/` outside `src/lib/whatsapp.ts` itself.

### F.12.5 QuickBookingBar service-dropdown fix

The reported bug — selecting "قسم التجميل" showed "لا توجد خدمات في
هذا القسم" even though "فيلر الشفاه" existed in Sanity — is fixed.

- `src/app/api/booking-options/route.ts` now runs two views in a single
  GROQ query:
  1. `departments[i].services` (inline, via `^._id` upward reference).
  2. `servicesBySlug` — a parallel lookup keyed by
     `department->slug.current`, which catches the other class of
     authoring mistake (the service references a department that doesn't
     list it in its inline `services[]`).
- The API returns both, but **also merges the fallback into the inline
  view**, so existing inline-only consumers still work.
- `QuickBookingBar.tsx` consumes `servicesByDepartmentSlug` as an
  explicit fallback when `selectedDept.services` is empty. The dropdown
  now always surfaces the right services for the picked department.
- Empty-state copy upgraded — `quickBooking.noServices` no longer just
  says "لا توجد خدمات…"; it now reads
  "لا توجد خدمات في هذا القسم — تواصل معنا للاستفسار" so the user knows
  what to do next.
- New "أو احجز عبر النموذج الكامل" / "Or book via the full form" link
  below the submit button, routing to `/book?department=…&service=…`
  with the user's current selection pre-filled.
- ISR tags expanded — the API route is now invalidated by both
  `department` and `service` tag purges.

### F.12.6 New translation keys

`messages/{ar,en}.json`:

- `departments.common.bookThisService`, `bookThisOffer`.
- `quickBooking.noServicesHelp`, `fullFormLink` (replaces inline string).
- Entire new namespace `bookingFlow.*`:
  - `metaTitle`, `metaDescription`, `title`, `subtitle`
  - `progress` (template `"الخطوة {current} من {total}"`)
  - `back`, `next`, `submit`, `sending`
  - `step1.{title,description}` / `step2.{title,description,selectButton,empty,skipNote}` / `step3.{title,description}`
  - `timePreference.{label,morning,evening,any}`
  - `fields.{name,namePlaceholder,phone,phonePlaceholder,notes,notesPlaceholder}`
  - `summary.{department,service}`
  - `support.{title,description,typeLabel,submit}` (used when
    `?support=true`)

### F.12.7 Files touched

**Added**
- `src/app/[locale]/book/page.tsx`
- `src/components/booking/BookingFlow.tsx`
- `src/components/shared/BookButton.tsx`

**Modified**
- `src/lib/whatsapp.ts` (full rewrite, backwards-compatible)
- `src/app/api/booking-options/route.ts` (new dual-view query + fallback merge)
- `src/components/department/ServiceCard.tsx`
- `src/components/department/DoctorCard.tsx`
- `src/components/doctors/DoctorsDirectory.tsx`
- `src/components/booking/QuickBookingBar.tsx`
- `src/components/sections/BookingCTA.tsx`
- `src/components/sections/Hero.tsx`
- `src/components/layout/WhatsAppFloat.tsx`
- `src/components/insurance/InsuranceCalculator.tsx`
- `src/app/[locale]/departments/[slug]/page.tsx` (pass `departmentSlug` to ServiceCard)
- `src/app/[locale]/services/[slug]/page.tsx` (book-flow CTA, related ServiceCards, new whatsapp context)
- `src/app/[locale]/doctors/[slug]/page.tsx` (doctor-inquiry context)
- `src/app/[locale]/offers/page.tsx` (offer context + BookButton)
- `src/app/[locale]/blog/[slug]/page.tsx` (general share context)
- `src/messages/{ar,en}.json`

### F.12.8 Build verification

`npm run build` — **zero warnings, zero errors**. New route present in
the manifest:

| Route | Generation |
|---|---|
| `/[locale]/book` | Dynamic (ƒ) — reads `searchParams` for pre-fill. |

All previously-passing SSG / SSG-w-params routes still build.

### F.12.9 Manual test checklist (verified logic, not browser)

- [x] Service card on `/ar/departments/cosmetic` shows only
      "احجز هذه الخدمة" — no "اعرف المزيد" text remains in
      `ServiceCard.tsx`.
- [x] Clicking the body navigates to `/services/[slug]`; clicking the
      button navigates to `/book?department=cosmetic&service=lip-filler`
      thanks to `stopPropagation`.
- [x] `/book` (no params) → starts at Step 1.
- [x] `/book?department=cosmetic` → jumps to Step 2 with cosmetic
      pre-selected.
- [x] `/book?department=cosmetic&service=lip-filler` → jumps to Step 3
      pre-filled.
- [x] Back button traverses 3 → 2 → 1; jumps 3 → 1 when the chosen
      department has zero services.
- [x] Progress indicator dots and connectors update on every step.
- [x] QuickBookingBar — selecting any department now consults the
      slug-keyed fallback when `services[]` is inline-empty, so
      "قسم التجميل" → "فيلر الشفاه" loads.
- [x] No `https://wa.me/${CONTACT.whatsapp}?text=...` literal remains in
      `src/` outside `src/lib/whatsapp.ts` itself.
- [x] Hero, BookingCTA, Contact, Doctors, Doctor detail, Service detail,
      Insurance, Offers, Blog, WhatsAppFloat, QuickBookingBar, and the
      Booking Flow all route their WhatsApp links through
      `getWhatsAppUrl(...)`.
