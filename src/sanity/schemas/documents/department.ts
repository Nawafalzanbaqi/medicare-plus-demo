import { defineType, defineField, defineArrayMember } from 'sanity'
import { BrandColorInput } from '../../components/BrandColorInput'
import { IconPicker } from '../../components/IconPicker'

export const department = defineType({
  name: 'department',
  title: 'قسم / Department',
  type: 'document',
  groups: [
    { name: 'identity', title: 'الهوية' },
    { name: 'visuals', title: 'الصور والألوان' },
    { name: 'content', title: 'المحتوى' },
    { name: 'specialized', title: 'محتوى متخصّص' },
    { name: 'pricing', title: 'الأسعار' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    // --------------------------------------------------------- IDENTIFICATION
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'الـ slug',
      group: 'identity',
      options: { source: 'name.en', maxLength: 60 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'name',
      type: 'localizedString',
      title: 'اسم القسم',
      group: 'identity',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tagline',
      type: 'localizedString',
      title: 'الشعار الفرعي',
      group: 'identity',
    }),
    defineField({
      name: 'shortDescription',
      type: 'localizedText',
      title: 'وصف مختصر (لشبكة الأقسام)',
      group: 'identity',
    }),
    defineField({
      name: 'fullDescription',
      type: 'localizedRichText',
      title: 'الوصف الكامل (لصفحة القسم)',
      group: 'identity',
    }),
    defineField({
      name: 'isFeatured',
      type: 'boolean',
      title: 'قسم مميّز (يظهر في القسم الذهبي بالصفحة الرئيسية)',
      initialValue: false,
      group: 'identity',
    }),
    defineField({
      name: 'featuredOrder',
      type: 'number',
      title: 'ترتيب القسم المميّز',
      initialValue: 100,
      hidden: ({ document }) => !document?.isFeatured,
      group: 'identity',
    }),
    defineField({
      name: 'displayOrder',
      type: 'number',
      title: 'ترتيب العرض في شبكة كل الأقسام',
      initialValue: 100,
      group: 'identity',
    }),
    defineField({
      name: 'isActive',
      type: 'boolean',
      title: 'القسم نشط (مرئي للزوّار)',
      initialValue: true,
      group: 'identity',
    }),

    // ----------------------------------------------------------------- VISUALS
    defineField({
      name: 'icon',
      type: 'string',
      title: 'الأيقونة',
      description: 'اختر من القائمة أو أدخل اسم أيقونة Phosphor.',
      components: { input: IconPicker },
      group: 'visuals',
    }),
    defineField({
      name: 'lottieFile',
      type: 'file',
      title: 'ملف Lottie (للقسم المميّز)',
      options: { accept: 'application/json,.json' },
      group: 'visuals',
    }),
    defineField({
      name: 'coverImage',
      type: 'image',
      title: 'صورة الغلاف (للبطاقة)',
      options: { hotspot: true },
      group: 'visuals',
    }),
    defineField({
      name: 'heroImage',
      type: 'image',
      title: 'صورة الـ Hero (لصفحة القسم)',
      options: { hotspot: true },
      group: 'visuals',
    }),
    defineField({
      name: 'gallery',
      type: 'array',
      title: 'معرض صور (اختياري)',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [{ name: 'alt', type: 'string', title: 'نص بديل' }],
        }),
      ],
      group: 'visuals',
    }),
    defineField({
      name: 'backgroundColor',
      type: 'string',
      title: 'لون خلفية البطاقة المميّزة',
      components: { input: BrandColorInput },
      group: 'visuals',
    }),
    defineField({
      name: 'accentColor',
      type: 'string',
      title: 'لون التمييز (تأثيرات، روابط)',
      components: { input: BrandColorInput },
      group: 'visuals',
    }),

    // ------------------------------------------------------ CONTENT REFERENCES
    defineField({
      name: 'services',
      type: 'array',
      title: 'الخدمات',
      of: [
        defineArrayMember({ type: 'reference', to: [{ type: 'service' }] }),
      ],
      group: 'content',
    }),
    defineField({
      name: 'doctors',
      type: 'array',
      title: 'الأطبّاء',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'doctor' }] })],
      group: 'content',
    }),
    defineField({
      name: 'highlights',
      type: 'array',
      title: 'نقاط مميّزة',
      description: 'نقاط سريعة تُعرض في شريط أسفل الـ Hero.',
      of: [defineArrayMember({ type: 'localizedString' })],
      group: 'content',
    }),
    defineField({
      name: 'faqs',
      type: 'array',
      title: 'الأسئلة الشائعة',
      of: [defineArrayMember({ type: 'faq' })],
      group: 'content',
    }),

    // ----------------------------------------------------- SPECIALIZED CONTENT
    defineField({
      name: 'beforeAfterImages',
      type: 'array',
      title: 'صور قبل/بعد (لقسم التجميل)',
      of: [defineArrayMember({ type: 'beforeAfterPair' })],
      group: 'specialized',
    }),
    defineField({
      name: 'equipment',
      type: 'array',
      title: 'الأجهزة والتقنيات (للجراحة/السمعيات)',
      of: [defineArrayMember({ type: 'equipmentItem' })],
      group: 'specialized',
    }),

    // ------------------------------------------------------------------ PRICING
    defineField({
      name: 'startingPrice',
      type: 'number',
      title: 'السعر الابتدائي (ريال)',
      group: 'pricing',
    }),
    defineField({
      name: 'showStartingPrice',
      type: 'boolean',
      title: 'إظهار السعر الابتدائي على الصفحة',
      initialValue: false,
      group: 'pricing',
    }),

    // ------------------------------------------------------------------ SEO
    defineField({
      name: 'seo',
      type: 'seoFields',
      title: 'SEO',
      group: 'seo',
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'tagline', media: 'coverImage' },
    prepare: ({ title, subtitle, media }) => ({
      title: title?.ar || title?.en || 'بدون اسم',
      subtitle: subtitle?.ar || subtitle?.en || '',
      media,
    }),
  },
  orderings: [
    {
      title: 'ترتيب العرض',
      name: 'displayOrder',
      by: [{ field: 'displayOrder', direction: 'asc' }],
    },
    {
      title: 'الأقسام المميّزة أولاً',
      name: 'featuredFirst',
      by: [
        { field: 'isFeatured', direction: 'desc' },
        { field: 'featuredOrder', direction: 'asc' },
      ],
    },
  ],
})
