'use client'

import { Globe } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { cn } from '@/lib/utils'

type Props = {
  variant?: 'topbar' | 'footer'
  className?: string
}

export function LanguageSwitcher({ variant = 'topbar', className }: Props) {
  const locale = useLocale()
  const pathname = usePathname()
  const t = useTranslations('common')

  const otherLocale = routing.locales.find((l) => l !== locale) ?? routing.defaultLocale

  const baseClasses =
    'inline-flex items-center gap-1.5 rounded-full text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-teal-deep'

  const variantClasses =
    variant === 'topbar'
      ? 'px-3 py-1 text-cream-light/90 hover:text-gold hover:bg-white/5'
      : 'px-3 py-1.5 text-cream-light/80 hover:text-gold border border-white/10 hover:border-gold/40'

  return (
    <Link
      href={pathname}
      locale={otherLocale}
      aria-label={t('switchLanguageAria')}
      className={cn(baseClasses, variantClasses, className)}
    >
      <Globe className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{t('switchLanguage')}</span>
    </Link>
  )
}
