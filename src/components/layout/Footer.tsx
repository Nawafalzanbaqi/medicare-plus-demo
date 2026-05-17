import { Mail, MapPin, Phone, Clock } from 'lucide-react'
import {
  InstagramLogoIcon,
  SnapchatLogoIcon,
  WhatsappLogoIcon,
} from '@phosphor-icons/react/dist/ssr'
import { getLocale, getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { CONTACT } from '@/lib/constants'
import { FEATURED_DEPARTMENTS } from '@/lib/data'
import { getFooter, getSiteSettings } from '@/sanity/lib/queries'
import { getWhatsAppUrl } from '@/lib/whatsapp'
import { createDataAttribute } from '@sanity/visual-editing/create-data-attribute'
import { dataset, projectId } from '@/sanity/env'
import { LanguageSwitcher } from './LanguageSwitcher'

const QUICK_LINKS = [
  { key: 'home', href: '/' },
  { key: 'departments', href: '/departments' },
  { key: 'doctors', href: '/doctors' },
  { key: 'insurance', href: '/insurance' },
  { key: 'blog', href: '/blog' },
  { key: 'about', href: '/about' },
  { key: 'contact', href: '/contact' },
] as const

export async function Footer() {
  const [tFooter, tNav, tDepts, tTop, locale, footerCms, settings] =
    await Promise.all([
      getTranslations('footer'),
      getTranslations('nav'),
      getTranslations('featuredDepartments'),
      getTranslations('topBar'),
      getLocale(),
      getFooter(),
      getSiteSettings(),
    ])

  const loc = locale as 'ar' | 'en'

  // CMS overrides — null means use translation/default.
  const description =
    (loc === 'ar' ? footerCms?.description?.ar : footerCms?.description?.en) ??
    tFooter('description')
  const copyright =
    (loc === 'ar' ? footerCms?.copyrightText?.ar : footerCms?.copyrightText?.en) ??
    tFooter('rights')
  const address =
    (loc === 'ar' ? settings?.address?.ar : settings?.address?.en) ??
    CONTACT.address[loc]
  const hoursText =
    (loc === 'ar' ? settings?.workingHours?.ar : settings?.workingHours?.en) ??
    tTop('hours')
  const phone = settings?.phone ?? CONTACT.phone
  const email = settings?.email ?? CONTACT.email

  // Visual-edit data attribute helper (no-op when Sanity isn't configured).
  const footerAttr = (path: string) =>
    projectId
      ? createDataAttribute({
          projectId,
          dataset,
          baseUrl: '/studio',
          id: 'footer',
          type: 'footer',
          path,
        }).toString()
      : undefined
  const instagramHandle =
    (settings?.socialLinks?.instagram ?? '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '') ||
    CONTACT.social.instagram.replace('@', '')
  const snapchatHandle =
    (settings?.socialLinks?.snapchat ?? '').replace(/^https?:\/\/(www\.)?snapchat\.com\/add\//, '') ||
    CONTACT.social.snapchat
  const showSocialLinks = footerCms?.showSocialLinks !== false

  return (
    <footer
      className="text-cream-light/80"
      style={{ backgroundColor: footerCms?.backgroundColor ?? '#0a2e2e' }}
    >
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Brand */}
          <div>
            <Link href="/" className="flex items-center gap-3">
              <span
                className="grid h-12 w-12 place-items-center rounded-full border-2 border-gold bg-gradient-to-br from-teal-deep to-teal-light shadow-soft"
                aria-hidden="true"
              >
                <span
                  className="text-2xl leading-none text-white"
                  style={{
                    fontFamily: 'var(--font-display-ar), serif',
                    fontWeight: 700,
                  }}
                >
                  ن
                </span>
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-sm font-semibold text-cream-light">
                  {tNav('brandName')}
                </span>
                <span className="text-[11px] font-medium uppercase tracking-wider text-gold">
                  {tNav('tagline')}
                </span>
              </span>
            </Link>

            <p
              className="mt-5 text-sm leading-relaxed text-cream-light/70"
              data-sanity={footerAttr(`description.${loc}`)}
            >
              {description}
            </p>

            {showSocialLinks && (
              <div className="mt-6 flex items-center gap-3">
                <a
                  href={getWhatsAppUrl({ locale: loc, page: 'home' })}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/5 text-cream-light/80 transition-colors hover:bg-gold hover:text-teal-deep"
                >
                  <WhatsappLogoIcon size={18} weight="bold" />
                </a>
                <a
                  href={`https://instagram.com/${instagramHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/5 text-cream-light/80 transition-colors hover:bg-gold hover:text-teal-deep"
                >
                  <InstagramLogoIcon size={18} weight="bold" />
                </a>
                <a
                  href={`https://snapchat.com/add/${snapchatHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Snapchat"
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/5 text-cream-light/80 transition-colors hover:bg-gold hover:text-teal-deep"
                >
                  <SnapchatLogoIcon size={18} weight="bold" />
                </a>
              </div>
            )}
          </div>

          {/* Column 2: Featured Departments */}
          <div>
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-gold">
              {tFooter('featuredDepts')}
            </h3>
            <ul className="space-y-3">
              {FEATURED_DEPARTMENTS.map((dept) => (
                <li key={dept.slug}>
                  <Link
                    href={`/departments/${dept.slug}`}
                    className="text-sm text-cream-light/70 transition-colors hover:text-gold"
                  >
                    {tDepts(`${dept.translationKey}.name`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div>
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-gold">
              {tFooter('quickLinks')}
            </h3>
            <ul className="space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="text-sm text-cream-light/70 transition-colors hover:text-gold"
                  >
                    {tNav(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-gold">
              {tFooter('contactUs')}
            </h3>
            <ul className="space-y-3 text-sm text-cream-light/70">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                <span>{address}</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                <a
                  href={`tel:${phone}`}
                  dir="ltr"
                  className="transition-colors hover:text-gold"
                >
                  {phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                <a
                  href={`mailto:${email}`}
                  className="transition-colors hover:text-gold"
                >
                  {email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                <span>{hoursText}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
          <p
            className="text-xs text-cream-light/60"
            data-sanity={footerAttr(`copyrightText.${loc}`)}
          >
            {copyright}
          </p>
          <LanguageSwitcher variant="footer" />
        </div>
      </div>
    </footer>
  )
}
