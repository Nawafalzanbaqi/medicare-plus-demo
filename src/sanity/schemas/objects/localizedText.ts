import { defineType, defineField } from 'sanity'

export const localizedText = defineType({
  name: 'localizedText',
  title: 'نص طويل ثنائي اللغة / Localized text',
  type: 'object',
  fields: [
    defineField({
      name: 'ar',
      title: 'العربية',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'en',
      title: 'English',
      type: 'text',
      rows: 4,
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { ar: 'ar', en: 'en' },
    prepare: ({ ar, en }) => ({
      title: (ar || en || '—').slice(0, 60),
      subtitle: (en || '').slice(0, 80),
    }),
  },
})
