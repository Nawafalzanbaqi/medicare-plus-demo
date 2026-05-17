import { defineType, defineField, defineArrayMember } from 'sanity'

export const article = defineType({
  name: 'article',
  title: 'مقال / Article',
  type: 'document',
  groups: [
    { name: 'core', title: 'المحتوى' },
    { name: 'visuals', title: 'الصور' },
    { name: 'meta', title: 'المعلومات' },
    { name: 'flags', title: 'الإعدادات' },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'title',
      type: 'localizedString',
      title: 'العنوان',
      group: 'core',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'الـ slug (ثنائي اللغة)',
      type: 'object',
      group: 'core',
      fields: [
        {
          name: 'ar',
          title: 'الـ slug العربي',
          type: 'slug',
          options: { source: 'title.ar', maxLength: 80, isUnique: () => true },
          validation: (Rule) => Rule.required(),
        },
        {
          name: 'en',
          title: 'English slug',
          type: 'slug',
          options: { source: 'title.en', maxLength: 80, isUnique: () => true },
          validation: (Rule) => Rule.required(),
        },
      ],
    }),
    defineField({
      name: 'excerpt',
      type: 'localizedText',
      title: 'الوصف القصير',
      group: 'core',
    }),
    defineField({
      name: 'content',
      type: 'localizedRichText',
      title: 'محتوى المقال',
      group: 'core',
    }),

    defineField({
      name: 'featuredImage',
      type: 'image',
      title: 'الصورة الرئيسية',
      options: { hotspot: true },
      group: 'visuals',
    }),
    defineField({
      name: 'gallery',
      type: 'array',
      title: 'معرض الصور',
      group: 'visuals',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [{ name: 'alt', type: 'string', title: 'نص بديل' }],
        }),
      ],
    }),

    defineField({
      name: 'category',
      type: 'reference',
      to: [{ type: 'department' }],
      title: 'الفئة (القسم المرتبط)',
      group: 'meta',
    }),
    defineField({
      name: 'author',
      type: 'reference',
      to: [{ type: 'doctor' }],
      title: 'الكاتب',
      group: 'meta',
    }),
    defineField({
      name: 'authorOverride',
      type: 'localizedString',
      title: 'اسم بديل للكاتب',
      description: 'استخدم إذا لم يكن الكاتب طبيباً مسجّلاً.',
      group: 'meta',
    }),
    defineField({
      name: 'tags',
      type: 'array',
      title: 'الوسوم',
      group: 'meta',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'readTime',
      type: 'number',
      title: 'مدة القراءة (دقائق)',
      group: 'meta',
      initialValue: 4,
      validation: (Rule) => Rule.min(1).max(30),
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      title: 'تاريخ النشر',
      group: 'meta',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'isPublished',
      type: 'boolean',
      title: 'منشور',
      initialValue: false,
      group: 'flags',
    }),
    defineField({
      name: 'isFeatured',
      type: 'boolean',
      title: 'مقال مميّز',
      initialValue: false,
      group: 'flags',
    }),

    defineField({
      name: 'seo',
      type: 'seoFields',
      title: 'SEO',
      group: 'seo',
    }),
  ],
  preview: {
    select: { title: 'title', media: 'featuredImage', date: 'publishedAt' },
    prepare: ({ title, media, date }) => ({
      title: title?.ar || title?.en || 'بدون عنوان',
      subtitle: date ? new Date(date).toISOString().slice(0, 10) : '',
      media,
    }),
  },
  orderings: [
    {
      title: 'الأحدث أولاً',
      name: 'publishedDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
})
