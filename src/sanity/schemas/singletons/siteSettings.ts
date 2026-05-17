import { defineType, defineField } from 'sanity'
import { CogIcon } from '@sanity/icons'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'إعدادات الموقع / Site settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    { name: 'identity', title: 'الهوية' },
    { name: 'contact', title: 'التواصل' },
    { name: 'social', title: 'التواصل الاجتماعي' },
    { name: 'theme', title: 'الألوان' },
    { name: 'seo', title: 'SEO' },
    { name: 'system', title: 'النظام' },
  ],
  fields: [
    defineField({
      name: 'siteName',
      type: 'localizedString',
      title: 'اسم الموقع',
      group: 'identity',
    }),
    defineField({
      name: 'tagline',
      type: 'localizedString',
      title: 'الشعار / Tagline',
      description: 'مثال: منذ عام 2010',
      group: 'identity',
    }),
    defineField({
      name: 'logo',
      type: 'image',
      title: 'الشعار',
      options: { hotspot: true },
      group: 'identity',
    }),
    defineField({
      name: 'favicon',
      type: 'image',
      title: 'أيقونة التبويب (Favicon)',
      group: 'identity',
    }),
    defineField({
      name: 'yearEstablished',
      type: 'number',
      title: 'سنة التأسيس',
      initialValue: 2010,
      group: 'identity',
    }),

    defineField({
      name: 'phone',
      type: 'string',
      title: 'رقم الهاتف',
      description: 'بصيغة دولية، مثل +966500000000',
      group: 'contact',
    }),
    defineField({
      name: 'whatsapp',
      type: 'string',
      title: 'رقم واتساب',
      description: 'بدون رمز + (مثل 966500000000)',
      group: 'contact',
    }),
    defineField({
      name: 'email',
      type: 'string',
      title: 'البريد الإلكتروني',
      group: 'contact',
    }),
    defineField({
      name: 'address',
      type: 'localizedString',
      title: 'العنوان',
      group: 'contact',
    }),
    defineField({
      name: 'workingHours',
      type: 'localizedString',
      title: 'ساعات العمل',
      group: 'contact',
    }),

    defineField({
      name: 'socialLinks',
      title: 'حسابات التواصل الاجتماعي',
      type: 'object',
      group: 'social',
      fields: [
        { name: 'instagram', type: 'url', title: 'Instagram' },
        { name: 'snapchat', type: 'url', title: 'Snapchat' },
        { name: 'twitter', type: 'url', title: 'X (Twitter)' },
        { name: 'tiktok', type: 'url', title: 'TikTok' },
        { name: 'youtube', type: 'url', title: 'YouTube' },
      ],
    }),

    defineField({
      name: 'primaryColor',
      type: 'string',
      title: 'اللون الأساسي',
      description: 'هكساديسيمال، مثل #0d3e3e',
      initialValue: '#0d3e3e',
      group: 'theme',
    }),
    defineField({
      name: 'accentColor',
      type: 'string',
      title: 'اللون المميّز',
      description: 'مثل #c9a961',
      initialValue: '#c9a961',
      group: 'theme',
    }),

    defineField({
      name: 'defaultSEO',
      type: 'seoFields',
      title: 'إعدادات SEO الافتراضية',
      group: 'seo',
    }),

    defineField({
      name: 'isMaintenanceMode',
      type: 'boolean',
      title: 'وضع الصيانة',
      description: 'إذا فُعّل، يُعرض صفحة "قيد الصيانة" بدلاً من الموقع.',
      initialValue: false,
      group: 'system',
    }),
  ],
  preview: {
    select: { name: 'siteName' },
    prepare: ({ name }) => ({
      title: name?.ar || name?.en || 'إعدادات الموقع',
      subtitle: name?.en || '',
    }),
  },
})
