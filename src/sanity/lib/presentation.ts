import { defineLocations, type PresentationPluginOptions } from 'sanity/presentation'

/**
 * Map document types to live URLs so the Presentation Tool can show
 * side-by-side preview and a "Used on these pages" panel inside the doc.
 */
export const presentationResolve: PresentationPluginOptions['resolve'] = {
  locations: {
    // Singletons → home pages
    homePage: defineLocations({
      message: 'هذه الصفحة الرئيسية',
      tone: 'positive',
      locations: [
        { title: 'الصفحة الرئيسية (AR)', href: '/ar' },
        { title: 'Home (EN)', href: '/en' },
      ],
    }),
    siteSettings: defineLocations({
      message: 'الإعدادات تظهر في كل الصفحات',
      tone: 'caution',
      locations: [
        { title: 'الموقع', href: '/ar' },
      ],
    }),
    topBar: defineLocations({
      message: 'الشريط العلوي يظهر في كل صفحة',
      tone: 'caution',
      locations: [{ title: 'الموقع', href: '/ar' }],
    }),
    footer: defineLocations({
      message: 'التذييل يظهر في كل صفحة',
      tone: 'caution',
      locations: [{ title: 'الموقع', href: '/ar' }],
    }),

    // Departments → /[locale]/departments/[slug]
    department: defineLocations({
      select: { name: 'name', slug: 'slug.current' },
      resolve: (doc) => ({
        locations: doc?.slug
          ? [
              { title: `صفحة القسم (AR) — ${doc.name?.ar ?? ''}`, href: `/ar/departments/${doc.slug}` },
              { title: `Department (EN) — ${doc.name?.en ?? ''}`, href: `/en/departments/${doc.slug}` },
            ]
          : [],
      }),
    }),

    // Articles → /[locale]/blog/[slug]
    article: defineLocations({
      select: {
        title: 'title',
        slugAr: 'slug.ar.current',
        slugEn: 'slug.en.current',
      },
      resolve: (doc) => ({
        locations: [
          ...(doc?.slugAr
            ? [{ title: `المقال (AR) — ${doc.title?.ar ?? ''}`, href: `/ar/blog/${doc.slugAr}` }]
            : []),
          ...(doc?.slugEn
            ? [{ title: `Article (EN) — ${doc.title?.en ?? ''}`, href: `/en/blog/${doc.slugEn}` }]
            : []),
        ],
      }),
    }),

    // Doctors → directory + filter intent (anchor by slug)
    doctor: defineLocations({
      select: { name: 'name' },
      resolve: (doc) => ({
        locations: [
          { title: `دليل الأطبّاء (AR) — ${doc?.name?.ar ?? ''}`, href: '/ar/doctors' },
          { title: `Doctors directory (EN) — ${doc?.name?.en ?? ''}`, href: '/en/doctors' },
        ],
      }),
    }),

    // Offers → /[locale]/offers
    offer: defineLocations({
      select: { title: 'title' },
      resolve: (doc) => ({
        locations: [
          { title: `العروض (AR) — ${doc?.title?.ar ?? ''}`, href: '/ar/offers' },
          { title: `Offers (EN) — ${doc?.title?.en ?? ''}`, href: '/en/offers' },
        ],
      }),
    }),

    // Testimonials → home (they appear in the testimonials carousel)
    testimonial: defineLocations({
      locations: [
        { title: 'الصفحة الرئيسية (AR)', href: '/ar' },
        { title: 'Home (EN)', href: '/en' },
      ],
    }),

    // Insurance providers → /[locale]/insurance
    insurance: defineLocations({
      locations: [
        { title: 'حاسبة التأمين (AR)', href: '/ar/insurance' },
        { title: 'Insurance calculator (EN)', href: '/en/insurance' },
      ],
    }),
  },
}
