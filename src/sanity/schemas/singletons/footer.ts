import { defineType, defineField, defineArrayMember } from 'sanity'

export const footer = defineType({
  name: 'footer',
  title: 'التذييل / Footer',
  type: 'document',
  fields: [
    defineField({
      name: 'description',
      type: 'localizedText',
      title: 'الوصف',
    }),
    defineField({
      name: 'backgroundColor',
      type: 'string',
      title: 'لون الخلفية',
      initialValue: '#0a2e2e',
    }),
    defineField({
      name: 'showSocialLinks',
      type: 'boolean',
      title: 'إظهار حسابات التواصل',
      initialValue: true,
    }),
    defineField({
      name: 'columnsConfig',
      type: 'array',
      title: 'أعمدة الروابط',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'footerColumn',
          fields: [
            { name: 'title', type: 'localizedString', title: 'عنوان العمود' },
            {
              name: 'links',
              type: 'array',
              title: 'الروابط',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'footerLink',
                  fields: [
                    { name: 'label', type: 'localizedString', title: 'النص' },
                    { name: 'url', type: 'string', title: 'الرابط' },
                  ],
                  preview: {
                    select: { title: 'label', url: 'url' },
                    prepare: ({ title, url }) => ({
                      title: title?.ar || title?.en || 'رابط',
                      subtitle: url || '',
                    }),
                  },
                }),
              ],
            },
          ],
          preview: {
            select: { title: 'title' },
            prepare: ({ title }) => ({
              title: title?.ar || title?.en || 'عمود',
            }),
          },
        }),
      ],
    }),
    defineField({
      name: 'copyrightText',
      type: 'localizedString',
      title: 'نص حقوق النشر',
    }),
    defineField({
      name: 'bottomBadges',
      type: 'array',
      title: 'شعارات أسفل التذييل',
      description: 'وزارة الصحة، رؤية 2030 …',
      of: [
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [{ name: 'alt', type: 'string', title: 'نص بديل' }],
        }),
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: 'التذييل' }),
  },
})
