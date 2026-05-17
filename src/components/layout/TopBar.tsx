import { Clock, Phone } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'
import { CONTACT } from '@/lib/constants'
import { getSiteSettings, getTopBar } from '@/sanity/lib/queries'
import { LanguageSwitcher } from './LanguageSwitcher'

export async function TopBar() {
  const [t, locale, settings, topBar] = await Promise.all([
    getTranslations('topBar'),
    getLocale(),
    getSiteSettings(),
    getTopBar(),
  ])

  // Default values; Sanity overrides only when fields are non-null.
  const isVisible = topBar?.isVisible !== false
  if (!isVisible) return null

  const showHours = topBar?.showHours !== false
  const showPhone = topBar?.showPhone !== false
  const showSwitcher = topBar?.showLanguageSwitcher !== false

  const phone = settings?.phone ?? CONTACT.phone
  const hoursText =
    (locale === 'ar' ? settings?.workingHours?.ar : settings?.workingHours?.en) ??
    t('hours')

  const style: React.CSSProperties = {
    backgroundColor: topBar?.backgroundColor ?? undefined,
    color: topBar?.textColor ?? undefined,
  }

  return (
    <div className="hidden bg-teal-deep text-cream-light/90 md:block" style={style}>
      <div className="container mx-auto flex h-9 items-center justify-between px-4 text-xs">
        {showHours ? (
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
            <span>{hoursText}</span>
          </div>
        ) : (
          <span aria-hidden="true" />
        )}

        <div className="flex items-center gap-4">
          {showPhone && (
            <>
              <a
                href={`tel:${phone}`}
                className="inline-flex items-center gap-2 transition-colors hover:text-gold"
              >
                <Phone className="h-3.5 w-3.5 text-gold" aria-hidden="true" />
                <span dir="ltr" className="font-medium tracking-wide">
                  {phone}
                </span>
              </a>
              {showSwitcher && (
                <span className="h-4 w-px bg-white/15" aria-hidden="true" />
              )}
            </>
          )}
          {showSwitcher && <LanguageSwitcher variant="topbar" />}
        </div>
      </div>
    </div>
  )
}
