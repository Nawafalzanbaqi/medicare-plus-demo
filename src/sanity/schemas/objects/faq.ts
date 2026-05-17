import { defineType, defineField } from 'sanity'

export const faq = defineType({
  name: 'faq',
  title: 'سؤال شائع / FAQ',
  type: 'object',
  fields: [
    defineField({
      name: 'question',
      type: 'localizedString',
      title: 'السؤال',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'answer',
      type: 'localizedText',
      title: 'الإجابة',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { title: 'question', subtitle: 'answer' },
    prepare: ({ title, subtitle }) => ({
      title: title?.ar || title?.en || 'سؤال',
      subtitle: subtitle?.ar || subtitle?.en || '',
    }),
  },
})
