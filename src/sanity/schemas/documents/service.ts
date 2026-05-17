import { defineType, defineField, defineArrayMember } from 'sanity'

export const service = defineType({
  name: 'service',
  title: 'خدمة / Service',
  type: 'document',
  groups: [
    { name: 'identity', title: 'الهوية' },
    { name: 'content', title: 'المحتوى التفصيلي' },
    { name: 'meta', title: 'السعر والإعدادات' },
    { name: 'faqs', title: 'الأسئلة الشائعة' },
  ],
  fields: [
    defineField({
      name: 'name',
      type: 'localizedString',
      title: 'اسم الخدمة',
      group: 'identity',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'الـ slug',
      group: 'identity',
      options: { source: 'name.en', maxLength: 80 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'localizedText',
      title: 'الوصف القصير (للبطاقة)',
      group: 'identity',
    }),
    defineField({
      name: 'department',
      type: 'reference',
      to: [{ type: 'department' }],
      title: 'القسم التابع له',
      group: 'identity',
    }),
    defineField({
      name: 'icon',
      type: 'string',
      title: 'اسم أيقونة Phosphor',
      group: 'identity',
    }),
    defineField({
      name: 'image',
      type: 'image',
      title: 'صورة الخدمة',
      options: { hotspot: true },
      group: 'identity',
    }),

    // ----------------------------------------------------- DETAILED CONTENT
    defineField({
      name: 'detailedDescription',
      type: 'localizedRichText',
      title: 'الوصف التفصيلي',
      description: 'يظهر في صفحة تفاصيل الخدمة.',
      group: 'content',
    }),
    defineField({
      name: 'benefits',
      type: 'array',
      title: 'الفوائد',
      description: 'نقاط الفوائد التي يحصل عليها المراجع.',
      of: [defineArrayMember({ type: 'localizedString' })],
      group: 'content',
    }),
    defineField({
      name: 'preparation',
      type: 'localizedRichText',
      title: 'التحضير قبل الجلسة',
      group: 'content',
    }),
    defineField({
      name: 'aftercare',
      type: 'localizedRichText',
      title: 'العناية بعد الجلسة',
      group: 'content',
    }),

    // ------------------------------------------------------------- META
    defineField({
      name: 'price',
      type: 'number',
      title: 'السعر (ريال)',
      group: 'meta',
    }),
    defineField({
      name: 'showPrice',
      type: 'boolean',
      title: 'إظهار السعر على البطاقة',
      initialValue: false,
      group: 'meta',
    }),
    defineField({
      name: 'duration',
      type: 'localizedString',
      title: 'مدة الجلسة',
      description: 'مثال: 30 دقيقة، جلسة واحدة',
      group: 'meta',
    }),
    defineField({
      name: 'isPopular',
      type: 'boolean',
      title: 'خدمة شائعة (يظهر وسم مميّز)',
      initialValue: false,
      group: 'meta',
    }),
    defineField({
      name: 'order',
      type: 'number',
      title: 'الترتيب داخل القسم',
      initialValue: 100,
      group: 'meta',
    }),

    // ------------------------------------------------------------- FAQs
    defineField({
      name: 'faqs',
      type: 'array',
      title: 'الأسئلة الشائعة لهذه الخدمة',
      of: [defineArrayMember({ type: 'faq' })],
      group: 'faqs',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      deptName: 'department.name',
      media: 'image',
    },
    prepare: ({ title, deptName, media }) => ({
      title: title?.ar || title?.en || 'بدون عنوان',
      subtitle: deptName?.ar || deptName?.en || '',
      media,
    }),
  },
  orderings: [
    {
      title: 'الترتيب',
      name: 'order',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
})
