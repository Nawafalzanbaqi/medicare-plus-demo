import type { Metadata } from 'next'
import { getLocale, getTranslations } from 'next-intl/server'
import {
  HouseIcon,
  StethoscopeIcon,
  UsersIcon,
  NewspaperIcon,
  ArrowRightIcon,
} from '@phosphor-icons/react/dist/ssr'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('notFound')
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    robots: { index: false, follow: false },
  }
}

export default async function NotFoundPage() {
  const locale = await getLocale()
  const t = await getTranslations('notFound')
  const isAr = locale === 'ar'

  const popularLinks = [
    {
      href: '/departments',
      label: t('popular.departments'),
      icon: StethoscopeIcon,
    },
    { href: '/doctors', label: t('popular.doctors'), icon: UsersIcon },
    { href: '/blog', label: t('popular.blog'), icon: NewspaperIcon },
  ]

  return (
    <section className="relative flex min-h-[70vh] items-center bg-cream-light py-20 sm:py-24 lg:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-32 start-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gold/15 blur-3xl" />
        <div className="absolute bottom-0 end-0 h-64 w-64 translate-x-1/3 translate-y-1/3 rounded-full bg-teal/10 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">
            {t('eyebrow')}
          </p>

          <h1
            aria-label={t('code')}
            className="mt-4 select-none bg-gradient-to-b from-teal-deep to-teal-light bg-clip-text font-display text-[clamp(7rem,22vw,12rem)] font-bold leading-none text-transparent"
          >
            404
          </h1>

          <h2 className="mt-4 text-2xl font-semibold text-teal-deep sm:text-3xl">
            {t('title')}
          </h2>

          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t('description')}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              render={<Link href="/" />}
              nativeButton={false}
              className="h-11 rounded-lg bg-teal-deep px-6 text-sm font-medium text-cream-light hover:bg-teal"
            >
              <HouseIcon
                size={18}
                weight="duotone"
                className="me-2"
                aria-hidden="true"
              />
              {t('backHome')}
              <ArrowRightIcon
                size={16}
                className="ms-2 rtl:rotate-180"
                aria-hidden="true"
              />
            </Button>

            <Button
              variant="outline"
              render={<Link href="/contact" />}
              nativeButton={false}
              className="h-11 rounded-lg border-teal-deep/20 px-6 text-sm font-medium text-teal-deep hover:bg-teal-deep/5"
            >
              {t('contact')}
            </Button>
          </div>

          <div className="mt-14">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {t('popular.heading')}
            </p>
            <ul className="mt-5 flex flex-wrap items-center justify-center gap-3">
              {popularLinks.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="group inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-teal-deep shadow-soft transition-all hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-medium"
                  >
                    <Icon
                      size={16}
                      weight="duotone"
                      className="text-gold"
                      aria-hidden="true"
                    />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-10 text-xs text-muted-foreground/80" dir={isAr ? 'rtl' : 'ltr'}>
            {t('helper')}
          </p>
        </div>
      </div>
    </section>
  )
}
