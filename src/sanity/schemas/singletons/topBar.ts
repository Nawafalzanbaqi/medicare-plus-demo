import { defineType, defineField } from 'sanity'

export const topBar = defineType({
  name: 'topBar',
  title: 'الشريط العلوي / Top bar',
  type: 'document',
  fields: [
    defineField({
      name: 'isVisible',
      type: 'boolean',
      title: 'إظهار الشريط',
      initialValue: true,
    }),
    defineField({
      name: 'showHours',
      type: 'boolean',
      title: 'إظهار ساعات العمل',
      initialValue: true,
    }),
    defineField({
      name: 'showPhone',
      type: 'boolean',
      title: 'إظهار رقم الهاتف',
      initialValue: true,
    }),
    defineField({
      name: 'showLanguageSwitcher',
      type: 'boolean',
      title: 'إظهار محوّل اللغة',
      initialValue: true,
    }),
    defineField({
      name: 'backgroundColor',
      type: 'string',
      title: 'لون الخلفية',
      initialValue: '#0d3e3e',
    }),
    defineField({
      name: 'textColor',
      type: 'string',
      title: 'لون النص',
      initialValue: '#fbf8f0',
    }),
  ],
  preview: {
    prepare: () => ({ title: 'الشريط العلوي' }),
  },
})
