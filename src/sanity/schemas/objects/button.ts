import { defineType, defineField } from 'sanity'

export const button = defineType({
  name: 'button',
  title: 'زر / Button',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'النص / Label',
      type: 'localizedString',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'الرابط / URL',
      type: 'string',
      description: 'مسار داخلي مثل /departments أو رابط كامل يبدأ بـ https://',
    }),
    defineField({
      name: 'style',
      title: 'النمط / Style',
      type: 'string',
      options: {
        list: [
          { title: 'Primary (teal)', value: 'primary' },
          { title: 'Secondary (gold)', value: 'secondary' },
          { title: 'Outline', value: 'outline' },
          { title: 'Ghost', value: 'ghost' },
        ],
        layout: 'radio',
      },
      initialValue: 'primary',
    }),
    defineField({
      name: 'icon',
      title: 'الأيقونة (اختياري)',
      type: 'string',
      description: 'اسم أيقونة Phosphor (مثل: whatsapp-logo, phone, arrow-right)',
    }),
    defineField({
      name: 'opensInWhatsApp',
      title: 'يفتح في واتساب',
      type: 'boolean',
      initialValue: false,
      description: 'عند التفعيل، الزر يفتح واتساب برسالة جاهزة حسب السياق.',
    }),
    defineField({
      name: 'whatsappContext',
      title: 'سياق رسالة واتساب',
      type: 'string',
      options: {
        list: [
          { title: 'الرئيسية', value: 'home' },
          { title: 'التجميل', value: 'cosmetic' },
          { title: 'الجراحة', value: 'surgery' },
          { title: 'السمعيات', value: 'audiology' },
          { title: 'العروض', value: 'offers' },
          { title: 'عام', value: 'general' },
        ],
      },
      initialValue: 'home',
      hidden: ({ parent }) => !parent?.opensInWhatsApp,
    }),
    defineField({
      name: 'openInNewTab',
      title: 'فتح في تبويب جديد',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'label',
      style: 'style',
      url: 'url',
    },
    prepare: ({ title, style, url }) => ({
      title: title?.ar || title?.en || 'زر',
      subtitle: `${style ?? 'primary'} · ${url ?? ''}`,
    }),
  },
})
