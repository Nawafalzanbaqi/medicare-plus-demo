import { defineType, defineField, defineArrayMember } from 'sanity'

const portableTextBody = [
  defineArrayMember({
    type: 'block',
    styles: [
      { title: 'فقرة / Normal', value: 'normal' },
      { title: 'عنوان 2', value: 'h2' },
      { title: 'عنوان 3', value: 'h3' },
      { title: 'اقتباس', value: 'blockquote' },
    ],
    lists: [
      { title: 'قائمة نقطية', value: 'bullet' },
      { title: 'قائمة مرقّمة', value: 'number' },
    ],
    marks: {
      decorators: [
        { title: 'Bold', value: 'strong' },
        { title: 'Italic', value: 'em' },
      ],
      annotations: [
        {
          name: 'link',
          type: 'object',
          title: 'رابط',
          fields: [
            { name: 'href', type: 'url', title: 'URL', validation: (Rule) => Rule.required() },
          ],
        },
      ],
    },
  }),
  defineArrayMember({
    type: 'image',
    options: { hotspot: true },
  }),
]

export const localizedRichText = defineType({
  name: 'localizedRichText',
  title: 'نص منسّق ثنائي اللغة / Localized rich text',
  type: 'object',
  fields: [
    defineField({
      name: 'ar',
      title: 'العربية',
      type: 'array',
      of: portableTextBody,
    }),
    defineField({
      name: 'en',
      title: 'English',
      type: 'array',
      of: portableTextBody,
    }),
  ],
})
