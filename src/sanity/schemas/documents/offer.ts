import { defineType, defineField } from 'sanity'

export const offer = defineType({
  name: 'offer',
  title: 'عرض / Offer',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'localizedString',
      title: 'عنوان العرض',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'localizedText',
      title: 'تفاصيل العرض',
    }),
    defineField({
      name: 'image',
      type: 'image',
      title: 'صورة العرض',
      options: { hotspot: true },
    }),
    defineField({
      name: 'department',
      type: 'reference',
      to: [{ type: 'department' }],
      title: 'القسم',
    }),
    defineField({
      name: 'service',
      type: 'reference',
      to: [{ type: 'service' }],
      title: 'الخدمة',
    }),
    defineField({
      name: 'originalPrice',
      type: 'number',
      title: 'السعر قبل العرض',
    }),
    defineField({
      name: 'offerPrice',
      type: 'number',
      title: 'السعر بعد الخصم',
    }),
    defineField({
      name: 'currency',
      type: 'string',
      title: 'العملة',
      initialValue: 'SAR',
    }),
    defineField({
      name: 'badgeText',
      type: 'localizedString',
      title: 'وسم العرض (مثل: حصري، خصم 30%)',
    }),
    defineField({
      name: 'validFrom',
      type: 'datetime',
      title: 'صالح من',
    }),
    defineField({
      name: 'validUntil',
      type: 'datetime',
      title: 'صالح حتى',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'terms',
      type: 'localizedRichText',
      title: 'الشروط والأحكام',
    }),
    defineField({
      name: 'maxBookings',
      type: 'number',
      title: 'الحد الأقصى للحجوزات (اختياري)',
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'isActive',
      type: 'boolean',
      title: 'العرض نشط',
      initialValue: true,
    }),
    defineField({
      name: 'isFeatured',
      type: 'boolean',
      title: 'عرض مميّز',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image',
      until: 'validUntil',
    },
    prepare: ({ title, media, until }) => ({
      title: title?.ar || title?.en || 'بدون عنوان',
      subtitle: until ? `حتى ${new Date(until).toISOString().slice(0, 10)}` : '',
      media,
    }),
  },
})
