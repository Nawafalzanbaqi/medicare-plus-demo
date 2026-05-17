import { defineType, defineField } from 'sanity'
import { BrandColorInput } from '../../components/BrandColorInput'

export const testimonial = defineType({
  name: 'testimonial',
  title: 'رأي مراجع / Testimonial',
  type: 'document',
  fields: [
    defineField({
      name: 'patientName',
      type: 'localizedString',
      title: 'اسم المراجع',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'patientInitial',
      type: 'string',
      title: 'الحرف الأول (للأفاتار)',
      description: 'حرف واحد فقط، يُستخدم في دائرة الأفاتار الملوّنة.',
      validation: (Rule) => Rule.max(2),
    }),
    defineField({
      name: 'rating',
      type: 'number',
      title: 'التقييم',
      options: {
        list: [
          { title: '5 / 5', value: 5 },
          { title: '4 / 5', value: 4 },
          { title: '3 / 5', value: 3 },
          { title: '2 / 5', value: 2 },
          { title: '1 / 5', value: 1 },
        ],
      },
      initialValue: 5,
      validation: (Rule) => Rule.required().min(1).max(5),
    }),
    defineField({
      name: 'comment',
      type: 'localizedText',
      title: 'التعليق',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'department',
      type: 'reference',
      to: [{ type: 'department' }],
      title: 'القسم الذي زاره',
    }),
    defineField({
      name: 'service',
      type: 'reference',
      to: [{ type: 'service' }],
      title: 'الخدمة (اختياري)',
    }),
    defineField({
      name: 'date',
      type: 'datetime',
      title: 'تاريخ الزيارة / المراجعة',
    }),
    defineField({
      name: 'avatarColor',
      type: 'string',
      title: 'لون الأفاتار',
      components: { input: BrandColorInput },
    }),
    defineField({
      name: 'isApproved',
      type: 'boolean',
      title: 'معتمد للنشر (موديريشن)',
      description: 'يجب اعتماد الرأي يدوياً قبل ظهوره على الموقع.',
      initialValue: false,
    }),
    defineField({
      name: 'isFeatured',
      type: 'boolean',
      title: 'رأي مميّز (يُعرض في الصفحة الرئيسية)',
      initialValue: false,
    }),
    defineField({
      name: 'displayOrder',
      type: 'number',
      title: 'ترتيب العرض',
      initialValue: 100,
    }),
  ],
  preview: {
    select: { title: 'patientName', rating: 'rating', approved: 'isApproved' },
    prepare: ({ title, rating, approved }) => ({
      title: title?.ar || title?.en || 'بدون اسم',
      subtitle: `${rating ?? '—'}/5${approved ? '' : ' · pending'}`,
    }),
  },
  orderings: [
    {
      title: 'الأحدث',
      name: 'dateDesc',
      by: [{ field: 'date', direction: 'desc' }],
    },
  ],
})
