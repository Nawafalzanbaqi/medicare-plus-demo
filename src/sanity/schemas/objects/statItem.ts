import { defineType, defineField } from 'sanity'

export const statItem = defineType({
  name: 'statItem',
  title: 'إحصائية / Stat',
  type: 'object',
  fields: [
    defineField({
      name: 'value',
      type: 'number',
      title: 'القيمة الرقمية',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'prefix',
      type: 'string',
      title: 'بادئة (مثل +)',
    }),
    defineField({
      name: 'suffix',
      type: 'string',
      title: 'لاحقة (مثل %)',
    }),
    defineField({
      name: 'decimals',
      type: 'number',
      title: 'عدد المنازل العشرية',
      initialValue: 0,
      validation: (Rule) => Rule.min(0).max(3),
    }),
    defineField({
      name: 'label',
      type: 'localizedString',
      title: 'الوصف / Label',
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: { value: 'value', suffix: 'suffix', label: 'label' },
    prepare: ({ value, suffix, label }) => ({
      title: `${value ?? '?'}${suffix ?? ''} — ${label?.ar || label?.en || ''}`,
    }),
  },
})
