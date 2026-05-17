import { defineType, defineField, defineArrayMember } from 'sanity'
import { BrandColorInput } from '../../components/BrandColorInput'

export const insurance = defineType({
  name: 'insurance',
  title: 'شركة تأمين / Insurance provider',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      type: 'localizedString',
      title: 'اسم الشركة',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'shortLabel',
      type: 'string',
      title: 'الاختصار (للشعار النصّي)',
    }),
    defineField({
      name: 'logo',
      type: 'image',
      title: 'الشعار',
      options: { hotspot: true },
    }),
    defineField({
      name: 'website',
      type: 'url',
      title: 'الموقع الإلكتروني',
    }),
    defineField({
      name: 'brandColor',
      type: 'string',
      title: 'اللون المميّز للشعار',
      initialValue: '#0d3e3e',
      components: { input: BrandColorInput },
    }),
    defineField({
      name: 'coverageNote',
      type: 'localizedText',
      title: 'ملاحظة عامة عن التغطية',
      description: 'تظهر للمراجع عند اختيار شركة التأمين هذه.',
    }),
    defineField({
      name: 'isActive',
      type: 'boolean',
      title: 'مقبول حالياً',
      initialValue: true,
    }),
    defineField({
      name: 'displayOrder',
      type: 'number',
      title: 'ترتيب العرض في القائمة',
      initialValue: 100,
    }),
    defineField({
      name: 'coverageRules',
      type: 'array',
      title: 'قواعد التغطية',
      description: 'لكل خدمة: نسبة التغطية + هل تتطلّب موافقة + ملاحظات.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'coverageRule',
          fields: [
            {
              name: 'service',
              type: 'reference',
              to: [{ type: 'service' }],
              title: 'الخدمة',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'percentage',
              type: 'number',
              title: 'نسبة التغطية (%)',
              validation: (Rule) => Rule.required().min(0).max(100),
            },
            {
              name: 'requiresApproval',
              type: 'boolean',
              title: 'تتطلّب موافقة مسبقة',
              initialValue: false,
            },
            {
              name: 'notes',
              type: 'localizedText',
              title: 'ملاحظات إضافية',
            },
          ],
          preview: {
            select: {
              serviceName: 'service.name',
              percentage: 'percentage',
              approval: 'requiresApproval',
            },
            prepare: ({ serviceName, percentage, approval }) => ({
              title: serviceName?.ar || serviceName?.en || 'خدمة',
              subtitle: `${percentage ?? 0}%${approval ? ' · يحتاج موافقة' : ''}`,
            }),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'name', media: 'logo', active: 'isActive' },
    prepare: ({ title, media, active }) => ({
      title: title?.ar || title?.en || 'بدون اسم',
      subtitle: active === false ? 'غير مقبول' : 'مقبول',
      media,
    }),
  },
  orderings: [
    {
      title: 'ترتيب العرض',
      name: 'displayOrder',
      by: [{ field: 'displayOrder', direction: 'asc' }],
    },
  ],
})
