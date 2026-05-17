import { defineType, defineField } from 'sanity'
import { BrandColorInput } from '../../components/BrandColorInput'
import { IconPicker } from '../../components/IconPicker'

export const card = defineType({
  name: 'card',
  title: 'بطاقة / Card',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      type: 'localizedString',
      title: 'العنوان / Title',
    }),
    defineField({
      name: 'description',
      type: 'localizedText',
      title: 'الوصف / Description',
    }),
    defineField({
      name: 'icon',
      type: 'string',
      title: 'الأيقونة',
      description: 'اختر من القائمة أو أدخل اسم أيقونة Phosphor.',
      components: { input: IconPicker },
    }),
    defineField({
      name: 'image',
      type: 'image',
      title: 'الصورة (اختياري)',
      options: { hotspot: true },
    }),
    defineField({
      name: 'backgroundColor',
      type: 'string',
      title: 'لون الخلفية',
      components: { input: BrandColorInput },
    }),
    defineField({
      name: 'textColor',
      type: 'string',
      title: 'لون النص',
      components: { input: BrandColorInput },
    }),
    defineField({
      name: 'badge',
      type: 'localizedString',
      title: 'شارة (مثل: جديد 2026)',
    }),
    defineField({
      name: 'order',
      type: 'number',
      title: 'الترتيب',
      initialValue: 100,
    }),
    defineField({
      name: 'cta',
      type: 'button',
      title: 'زر الإجراء (اختياري)',
    }),
  ],
  preview: {
    select: { title: 'title', description: 'description', media: 'image' },
    prepare: ({ title, description, media }) => ({
      title: title?.ar || title?.en || 'بطاقة',
      subtitle: description?.ar || description?.en || '',
      media,
    }),
  },
})
