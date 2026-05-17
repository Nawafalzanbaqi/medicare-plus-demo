import { defineType, defineField } from 'sanity'

export const localizedString = defineType({
  name: 'localizedString',
  title: 'نص ثنائي اللغة / Localized string',
  type: 'object',
  fields: [
    defineField({
      name: 'ar',
      title: 'العربية',
      type: 'string',
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'en',
      title: 'English',
      type: 'string',
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: { ar: 'ar', en: 'en' },
    prepare: ({ ar, en }) => ({ title: ar || en || '—', subtitle: en }),
  },
})
