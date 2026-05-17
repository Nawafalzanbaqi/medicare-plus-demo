'use client'

import { useEffect, useState } from 'react'
import { Menu, Phone } from 'lucide-react'
import { motion } from 'motion/react'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { CONTACT } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { LanguageSwitcher } from './LanguageSwitcher'

const NAV_LINKS = [
  { key: 'home', href: '/' },
  { key: 'departments', href: '/departments' },
  { key: 'doctors', href: '/doctors' },
  { key: 'insurance', href: '/insurance' },
  { key: 'blog', href: '/blog' },
  { key: 'about', href: '/about' },
  { key: 'contact', href: '/contact' },
] as const

function Logo() {
  const t = useTranslations('nav')
  return (
    <Link
      href="/"
      className="group flex items-center gap-3"
      aria-label={t('brandName')}
    >
      <span
        className="relative grid h-12 w-12 place-items-center rounded-full border-2 border-gold bg-gradient-to-br from-teal-deep to-teal-light text-cream-light shadow-soft transition-transform group-hover:scale-105"
        aria-hidden="true"
      >
        <span
          className="text-2xl leading-none text-white"
          style={{ fontFamily: 'var(--font-display-ar), serif', fontWeight: 700 }}
        >
          ن
        </span>
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-sm font-semibold text-teal-deep sm:text-base">
          {t('brandName')}
        </span>
        <span className="text-[11px] font-medium uppercase tracking-wider text-gold">
          {t('tagline')}
        </span>
      </span>
    </Link>
  )
}

function NavLinks({ className }: { className?: string }) {
  const t = useTranslations('nav')
  return (
    <ul className={cn('flex items-center gap-1', className)}>
      {NAV_LINKS.map((link) => (
        <li key={link.key}>
          <motion.div whileHover={{ y: -1 }} transition={{ duration: 0.2 }}>
            <Link
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-ink/80 transition-colors hover:bg-cream hover:text-teal-deep"
            >
              {t(link.key)}
            </Link>
          </motion.div>
        </li>
      ))}
    </ul>
  )
}

export function Navbar() {
  const t = useTranslations('nav')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const isRtl = locale === 'ar'
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-all duration-300',
        scrolled
          ? 'border-b border-line bg-cream-light/85 shadow-soft backdrop-blur-md'
          : 'bg-cream-light',
      )}
    >
      <nav className="container mx-auto flex h-16 items-center justify-between px-4 sm:h-20">
        <Logo />

        <NavLinks className="hidden lg:flex" />

        <div className="hidden items-center gap-3 lg:flex">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              render={<a href={`tel:${CONTACT.phone}`} />}
              nativeButton={false}
              className="rounded-lg bg-teal-deep text-cream-light shadow-soft hover:bg-teal"
            >
              <Phone className="me-2 h-4 w-4" aria-hidden="true" />
              {tCommon('bookAppointment')}
            </Button>
          </motion.div>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <Button
            render={<a href={`tel:${CONTACT.phone}`} aria-label={tCommon('callUs')} />}
            nativeButton={false}
            size="sm"
            className="rounded-lg bg-teal-deep text-cream-light hover:bg-teal"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
          </Button>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label={t('openMenu')}
                />
              }
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </SheetTrigger>

            <SheetContent
              side={isRtl ? 'right' : 'left'}
              className="w-[85vw] max-w-sm bg-cream-light p-0"
            >
              <SheetHeader className="border-b border-line p-6">
                <SheetTitle className="text-teal-deep">
                  {t('brandName')}
                </SheetTitle>
                <p className="text-xs uppercase tracking-wider text-muted">
                  {t('tagline')}
                </p>
              </SheetHeader>

              <ul className="flex flex-1 flex-col gap-1 p-4">
                {NAV_LINKS.map((link) => (
                  <li key={link.key}>
                    <SheetClose
                      render={
                        <Link
                          href={link.href}
                          className="block rounded-lg px-4 py-3 text-base font-medium text-ink/85 transition-colors hover:bg-cream hover:text-teal-deep"
                        />
                      }
                    >
                      {t(link.key)}
                    </SheetClose>
                  </li>
                ))}
              </ul>

              <div className="border-t border-line p-4">
                <Button
                  render={<a href={`tel:${CONTACT.phone}`} />}
                  nativeButton={false}
                  className="w-full rounded-lg bg-teal-deep text-cream-light hover:bg-teal"
                >
                  <Phone className="me-2 h-4 w-4" aria-hidden="true" />
                  {tCommon('bookAppointment')}
                </Button>
                <div className="mt-3 flex justify-center">
                  <LanguageSwitcher variant="footer" />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  )
}
