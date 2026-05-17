import { defineType, defineField } from 'sanity'

export const equipmentItem = defineType({
  name: 'equipmentItem',
  title: 'جهاز / Equipment',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      type: 'localizedString',
      title: 'اسم الجهاز',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'localizedText',
      title: 'الوصف',
    }),
    defineField({
      name: 'image',
      type: 'image',
      title: 'صورة الجهاز',
      options: { hotspot: true },
    }),
  ],
  preview: {
    select: { title: 'name', description: 'description', media: 'image' },
    prepare: ({ title, description, media }) => ({
      title: title?.ar || title?.en || 'جهاز',
      subtitle: description?.ar || description?.en || '',
      media,
    }),
  },
})
