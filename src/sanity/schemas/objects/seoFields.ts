import { defineType, defineField } from 'sanity'

export const seoFields = defineType({
  name: 'seoFields',
  title: 'SEO',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      type: 'localizedString',
      title: 'عنوان الصفحة / Meta title',
      description: '50-60 حرفاً مثالياً',
    }),
    defineField({
      name: 'description',
      type: 'localizedText',
      title: 'وصف الصفحة / Meta description',
      description: '150-160 حرفاً مثالياً',
    }),
    defineField({
      name: 'ogImage',
      type: 'image',
      title: 'صورة المشاركة / OG Image',
      options: { hotspot: true },
      description: '1200×630px موصى به',
    }),
    defineField({
      name: 'keywords',
      type: 'array',
      title: 'كلمات مفتاحية',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'noIndex',
      type: 'boolean',
      title: 'إخفاء من محركات البحث',
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: 'title', description: 'description', media: 'ogImage' },
    prepare: ({ title, description, media }) => ({
      title: title?.ar || title?.en || 'SEO',
      subtitle: description?.ar || description?.en || '',
      media,
    }),
  },
})
