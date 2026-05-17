import { defineType, defineField } from 'sanity'

export const beforeAfterPair = defineType({
  name: 'beforeAfterPair',
  title: 'مقارنة قبل/بعد',
  type: 'object',
  fields: [
    defineField({
      name: 'treatment',
      type: 'localizedString',
      title: 'اسم العلاج',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'before',
      type: 'image',
      title: 'قبل',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'after',
      type: 'image',
      title: 'بعد',
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'duration',
      type: 'localizedString',
      title: 'مدة العلاج (مثل: 4 جلسات)',
    }),
  ],
  preview: {
    select: { title: 'treatment', duration: 'duration', media: 'after' },
    prepare: ({ title, duration, media }) => ({
      title: title?.ar || title?.en || 'مقارنة',
      subtitle: duration?.ar || duration?.en || '',
      media,
    }),
  },
})
