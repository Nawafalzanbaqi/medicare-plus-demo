export const CONTACT = {
  phone: '+966500000000',
  whatsapp: '966500000000',
  email: 'info@medicare-plus-demo.vercel.app',
  address: {
    ar: 'الرياض - حي العليا',
    en: 'Riyadh - Al-Olaya District',
  },
  social: {
    instagram: '@carenahdah',
    snapchat: 'carenahdah',
  },
} as const

export const LOCALES = ['ar', 'en'] as const
export const DEFAULT_LOCALE = 'ar' as const

export type Locale = (typeof LOCALES)[number]
