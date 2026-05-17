import { defineType, defineField, defineArrayMember } from 'sanity'
import { BrandColorInput } from '../../components/BrandColorInput'

export const trustBar = defineType({
  name: 'trustBar',
  title: 'شريط الثقة العلوي / Trust bar',
  type: 'document',
  fields: [
    defineField({
      name: 'isVisible',
      title: 'إظهار شريط الثقة',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'items',
      title: 'عناصر الشريط (حتى 5)',
      type: 'array',
      validation: (Rule) => Rule.max(5),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'trustBarItem',
          fields: [
            defineField({
              name: 'icon',
              title: 'اسم الأيقونة (Phosphor)',
              description: 'اسم Phosphor كَـ kebab-case (star, certificate, credit-card …)',
              type: 'string',
            }),
            defineField({
              name: 'text',
              title: 'النص',
              type: 'localizedString',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'link',
              title: 'رابط (اختياري)',
              type: 'string',
            }),
          ],
          preview: {
            select: { text: 'text', icon: 'icon' },
            prepare: ({ text, icon }: { text?: { ar?: string; en?: string }; icon?: string }) => ({
              title: text?.ar || text?.en || 'عنصر',
              subtitle: icon || '',
            }),
          },
        }),
      ],
    }),
    defineField({
      name: 'backgroundColor',
      title: 'لون الخلفية',
      type: 'string',
      initialValue: '#f7f2e8',
      components: { input: BrandColorInput },
    }),
    defineField({
      name: 'textColor',
      title: 'لون النص',
      type: 'string',
      initialValue: '#1a2424',
      components: { input: BrandColorInput },
    }),
  ],
  preview: {
    prepare: () => ({ title: 'شريط الثقة العلوي' }),
  },
})
