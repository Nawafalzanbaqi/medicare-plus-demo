'use client'

import { WhatsappLogoIcon } from '@phosphor-icons/react/dist/ssr'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import {
  detectWhatsAppPage,
  getWhatsAppUrl,
  type WhatsAppMessageType,
} from '@/lib/whatsapp'

const DEPARTMENT_LABEL: Record<string, { ar: string; en: string }> = {
  cosmetic: { ar: 'قسم التجميل', en: 'Cosmetic Department' },
  surgery: { ar: 'قسم الجراحة', en: 'Surgery Department' },
  audiology: { ar: 'قسم السمعيات', en: 'Audiology Department' },
}

export function WhatsAppFloat() {
  const tCommon = useTranslations('common')
  const locale = useLocale() as 'ar' | 'en'
  const pathname = usePathname()
  const page = detectWhatsAppPage(pathname ?? '/')

  // Tailor the WhatsApp message to where the user clicked from.
  // - Home/about/contact/offers → 'inquiry' (no preset booking).
  // - Cosmetic/surgery/audiology landing → 'general' with department context.
  const departmentInfo = DEPARTMENT_LABEL[page]
  const type: WhatsAppMessageType = departmentInfo ? 'general' : 'inquiry'

  const href = getWhatsAppUrl({
    type,
    locale,
    department: departmentInfo
      ? { slug: page, name: departmentInfo[locale] }
      : null,
  })

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={tCommon('whatsapp')}
      className="group fixed bottom-6 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-medium transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 sm:h-16 sm:w-16"
      style={{ insetInlineStart: '1.5rem' }}
    >
      <span
        className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-40"
        aria-hidden="true"
      />
      <span
        className="absolute inline-flex h-full w-full rounded-full bg-[#25D366]/30"
        aria-hidden="true"
      />
      <WhatsappLogoIcon
        size={28}
        weight="fill"
        className="relative z-10 transition-transform group-hover:scale-110"
      />
    </a>
  )
}
