import { defineType, defineField, defineArrayMember } from 'sanity'
import { BrandColorInput } from '../../components/BrandColorInput'

const isVisibleField = defineField({
  name: 'isVisible',
  title: 'إظهار القسم',
  type: 'boolean',
  initialValue: true,
})

const iconField = defineField({
  name: 'icon',
  title: 'اسم الأيقونة',
  description: 'اسم أيقونة Phosphor (sparkle, ear, heart …) أو Lucide (clock, microscope …)',
  type: 'string',
})

const trustItem = defineArrayMember({
  type: 'object',
  name: 'trustItem',
  fields: [
    iconField,
    defineField({ name: 'title', type: 'localizedString', title: 'العنوان' }),
    defineField({ name: 'description', type: 'localizedString', title: 'الوصف' }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'description' },
    prepare: ({ title, subtitle }) => ({
      title: title?.ar || title?.en || 'عنصر',
      subtitle: subtitle?.ar || subtitle?.en || '',
    }),
  },
})

const whyUsFeature = defineArrayMember({
  type: 'object',
  name: 'whyUsFeature',
  fields: [
    iconField,
    defineField({ name: 'title', type: 'localizedString', title: 'العنوان' }),
    defineField({ name: 'description', type: 'localizedString', title: 'الوصف' }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'description' },
    prepare: ({ title, subtitle }) => ({
      title: title?.ar || title?.en || 'ميزة',
      subtitle: subtitle?.ar || subtitle?.en || '',
    }),
  },
})

export const homePage = defineType({
  name: 'homePage',
  title: 'الصفحة الرئيسية / Home page',
  type: 'document',
  groups: [
    { name: 'hero', title: 'القسم الرئيسي' },
    { name: 'featured', title: 'الأقسام المميّزة' },
    { name: 'trust', title: 'شريط الثقة' },
    { name: 'all', title: 'كل الأقسام' },
    { name: 'why', title: 'لماذا ميديكير بلس' },
    { name: 'testimonials', title: 'الآراء' },
    { name: 'booking', title: 'احجز موعدك' },
    { name: 'order', title: 'ترتيب الأقسام' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    // ---------------------------------------------- HERO
    defineField({
      name: 'hero',
      title: 'القسم الرئيسي (Hero)',
      type: 'object',
      group: 'hero',
      fields: [
        isVisibleField,
        defineField({ name: 'badge', type: 'localizedString', title: 'البادج (نص علوي)' }),
        defineField({
          name: 'title',
          type: 'localizedRichText',
          title: 'العنوان الرئيسي',
          description: 'استخدم Italic (em) لتمييز الكلمات باللون الذهبي.',
        }),
        defineField({ name: 'description', type: 'localizedText', title: 'الوصف' }),
        defineField({ name: 'primaryCTA', type: 'button', title: 'الزر الأساسي' }),
        defineField({ name: 'secondaryCTA', type: 'button', title: 'الزر الثانوي' }),
        defineField({
          name: 'stats',
          title: 'الإحصائيات (حتى 5)',
          type: 'array',
          of: [defineArrayMember({ type: 'statItem' })],
          validation: (Rule) => Rule.max(5),
        }),
        defineField({
          name: 'heroImage',
          type: 'image',
          title: 'صورة الـ Hero',
          options: { hotspot: true },
        }),
        defineField({
          name: 'floatingCards',
          title: 'البطاقات العائمة (حتى 3)',
          type: 'array',
          of: [defineArrayMember({ type: 'card' })],
          validation: (Rule) => Rule.max(3),
        }),
        defineField({
          name: 'backgroundStyle',
          title: 'نمط الخلفية',
          type: 'string',
          options: {
            list: [
              { title: 'تدرّج كريم (افتراضي)', value: 'cream-gradient' },
              { title: 'تيل خفيف', value: 'teal-subtle' },
              { title: 'كريم سادة', value: 'solid-cream' },
              { title: 'صورة مخصّصة', value: 'custom' },
            ],
            layout: 'radio',
          },
          initialValue: 'cream-gradient',
        }),
        defineField({
          name: 'customBackground',
          title: 'صورة الخلفية المخصّصة',
          type: 'image',
          options: { hotspot: true },
          hidden: ({ parent }) =>
            (parent as { backgroundStyle?: string } | undefined)?.backgroundStyle !==
            'custom',
        }),
      ],
    }),

    // ---------------------------------------------- FEATURED DEPARTMENTS
    defineField({
      name: 'featuredDepartments',
      title: 'الأقسام المميّزة',
      type: 'object',
      group: 'featured',
      fields: [
        isVisibleField,
        defineField({ name: 'eyebrow', type: 'localizedString', title: 'النص فوق العنوان' }),
        defineField({ name: 'title', type: 'localizedString', title: 'العنوان' }),
        defineField({ name: 'description', type: 'localizedText', title: 'الوصف' }),
        defineField({
          name: 'departments',
          title: 'الأقسام (3 بالضبط)',
          type: 'array',
          of: [
            defineArrayMember({ type: 'reference', to: [{ type: 'department' }] }),
          ],
          validation: (Rule) => Rule.length(3),
        }),
        defineField({
          name: 'backgroundColor',
          type: 'string',
          title: 'لون الخلفية',
          components: { input: BrandColorInput },
        }),
        defineField({
          name: 'showNumbers',
          title: 'إظهار الأرقام (01 02 03)',
          type: 'boolean',
          initialValue: true,
        }),
      ],
    }),

    // ---------------------------------------------- TRUST STRIP
    defineField({
      name: 'trustStrip',
      title: 'شريط الثقة',
      type: 'object',
      group: 'trust',
      fields: [
        isVisibleField,
        defineField({
          name: 'items',
          title: 'العناصر (حتى 4)',
          type: 'array',
          of: [trustItem],
          validation: (Rule) => Rule.max(4),
        }),
      ],
    }),

    // ---------------------------------------------- ALL DEPARTMENTS
    defineField({
      name: 'allDepartments',
      title: 'كل الأقسام',
      type: 'object',
      group: 'all',
      fields: [
        isVisibleField,
        defineField({ name: 'eyebrow', type: 'localizedString', title: 'النص فوق العنوان' }),
        defineField({ name: 'title', type: 'localizedString', title: 'العنوان' }),
        defineField({
          name: 'departments',
          title: 'الأقسام',
          type: 'array',
          of: [
            defineArrayMember({ type: 'reference', to: [{ type: 'department' }] }),
          ],
        }),
      ],
    }),

    // ---------------------------------------------- WHY US
    defineField({
      name: 'whyUs',
      title: 'لماذا ميديكير بلس',
      type: 'object',
      group: 'why',
      fields: [
        isVisibleField,
        defineField({ name: 'eyebrow', type: 'localizedString', title: 'النص فوق العنوان' }),
        defineField({ name: 'title', type: 'localizedString', title: 'العنوان' }),
        defineField({ name: 'description', type: 'localizedText', title: 'الوصف' }),
        defineField({
          name: 'features',
          title: 'المزايا',
          type: 'array',
          of: [whyUsFeature],
        }),
        defineField({
          name: 'showCounter',
          title: 'إظهار عدّاد السنوات',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'counterStartYear',
          type: 'number',
          title: 'سنة البداية',
          initialValue: 2010,
        }),
        defineField({
          name: 'badges',
          title: 'شارات الاعتماد',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'image',
              options: { hotspot: true },
              fields: [{ name: 'alt', type: 'string', title: 'نص بديل' }],
            }),
          ],
        }),
      ],
    }),

    // ---------------------------------------------- TESTIMONIALS
    defineField({
      name: 'testimonialsSection',
      title: 'آراء المراجعين',
      type: 'object',
      group: 'testimonials',
      fields: [
        isVisibleField,
        defineField({ name: 'eyebrow', type: 'localizedString', title: 'النص فوق العنوان' }),
        defineField({ name: 'title', type: 'localizedString', title: 'العنوان' }),
        defineField({ name: 'description', type: 'localizedText', title: 'الوصف' }),
        defineField({
          name: 'showOnlyApproved',
          title: 'إظهار الآراء المعتمدة فقط',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'autoScroll',
          title: 'التمرير التلقائي',
          type: 'boolean',
          initialValue: true,
        }),
      ],
    }),

    // ---------------------------------------------- BOOKING CTA
    defineField({
      name: 'bookingCTA',
      title: 'احجز موعدك',
      type: 'object',
      group: 'booking',
      fields: [
        isVisibleField,
        defineField({ name: 'eyebrow', type: 'localizedString', title: 'النص فوق العنوان' }),
        defineField({
          name: 'title',
          type: 'localizedRichText',
          title: 'العنوان (يدعم em الذهبي)',
        }),
        defineField({ name: 'description', type: 'localizedText', title: 'الوصف' }),
        defineField({ name: 'whatsappButton', type: 'button', title: 'زر واتساب' }),
        defineField({ name: 'phoneButton', type: 'button', title: 'زر الاتصال' }),
        defineField({
          name: 'backgroundColor',
          type: 'string',
          title: 'لون الخلفية',
          components: { input: BrandColorInput },
        }),
        defineField({
          name: 'backgroundImage',
          title: 'صورة الخلفية (اختياري)',
          type: 'image',
          options: { hotspot: true },
        }),
      ],
    }),

    // ---------------------------------------------- SECTION ORDER
    defineField({
      name: 'sectionOrder',
      title: 'ترتيب الأقسام (اسحب وأفلِت لإعادة الترتيب)',
      type: 'array',
      group: 'order',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'القسم الرئيسي', value: 'hero' },
          { title: 'الأقسام المميّزة', value: 'featuredDepartments' },
          { title: 'شريط الثقة', value: 'trustStrip' },
          { title: 'كل الأقسام', value: 'allDepartments' },
          { title: 'لماذا ميديكير بلس', value: 'whyUs' },
          { title: 'آراء المراجعين', value: 'testimonialsSection' },
          { title: 'احجز موعدك', value: 'bookingCTA' },
        ],
      },
      initialValue: [
        'hero',
        'featuredDepartments',
        'trustStrip',
        'allDepartments',
        'whyUs',
        'testimonialsSection',
        'bookingCTA',
      ],
    }),

    // ---------------------------------------------- SEO
    defineField({
      name: 'seo',
      type: 'seoFields',
      title: 'SEO',
      group: 'seo',
    }),
  ],
  preview: { prepare: () => ({ title: 'الصفحة الرئيسية' }) },
})
