import { ChevronRight, Phone } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { SafeImage } from '@/components/shared/SafeImage'
import { CONTACT } from '@/lib/constants'
import { getWhatsAppUrl, type WhatsAppPage } from '@/lib/whatsapp'

type Props = {
  slug: string
  name: string
  tagline: string
  description: string
  image: string | null
}

const FEATURED: WhatsAppPage[] = ['cosmetic', 'surgery', 'audiology']

export function DepartmentHero({ slug, name, tagline, description, image }: Props) {
  const t = useTranslations('departments.common')
  const tCommon = useTranslations('common')
  const locale = useLocale() as 'ar' | 'en'

  const page: WhatsAppPage = (FEATURED as string[]).includes(slug)
    ? (slug as WhatsAppPage)
    : 'home'

  // Non-featured slugs (dental, internal, etc.) fall back to the generic
  // home message but append the department name as `service` so the receiver
  // still sees which department the lead is for.
  const whatsappHref = getWhatsAppUrl({
    locale,
    page,
    service: page === 'home' ? name : undefined,
  })

  return (
    <section className="relative overflow-hidden bg-cream-light">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 100% 0%, rgba(201,169,97,0.08) 0%, transparent 60%)',
        }}
      />

      <div className="container relative mx-auto grid gap-10 px-4 pt-10 pb-20 sm:pt-12 lg:grid-cols-5 lg:gap-12 lg:pt-14 lg:pb-24">
        {/* Text col */}
        <div className="flex flex-col gap-6 lg:col-span-3">
          <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/" className="transition-colors hover:text-teal-deep">
              {t('breadcrumbHome')}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
            <Link href="/departments" className="transition-colors hover:text-teal-deep">
              {t('breadcrumbDepartments')}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
            <span className="text-teal-deep">{name}</span>
          </nav>

          <h1 className="font-semibold leading-[1.1] text-teal-deep text-[clamp(2rem,4.2vw,3.4rem)]">
            {name}
          </h1>

          <p className="text-base font-medium text-gold sm:text-lg">{tagline}</p>

          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {description}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Button
              render={
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" />
              }
              nativeButton={false}
              size="lg"
              className="h-12 rounded-lg bg-teal-deep px-6 text-base text-cream-light shadow-medium hover:bg-teal"
            >
              {t('bookConsultation')}
            </Button>
            <Button
              render={<a href={`tel:${CONTACT.phone}`} />}
              nativeButton={false}
              variant="outline"
              size="lg"
              className="h-12 rounded-lg border-teal-deep/25 px-6 text-base text-teal-deep hover:bg-cream hover:text-teal-deep"
            >
              <Phone className="me-2 h-4 w-4" aria-hidden="true" />
              {tCommon('callUs')}
            </Button>
          </div>
        </div>

        {/* Image col */}
        <div className="relative h-[320px] overflow-hidden rounded-3xl shadow-strong sm:h-[420px] lg:col-span-2 lg:h-[520px]">
          <SafeImage
            src={image}
            alt={name}
            priority
            sizes="(max-width: 1024px) 100vw, 40vw"
            aspect="auto"
            wrapperClassName="absolute inset-0 h-full w-full rounded-3xl"
            rounded={false}
            locale={locale}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, transparent 60%, rgba(13,62,62,0.35) 100%)',
            }}
          />
          <span
            className="absolute bottom-5 inline-flex items-center gap-2 rounded-full bg-cream-light/95 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-teal-deep shadow-soft"
            style={{ insetInlineStart: '1.25rem' }}
            data-slug={slug}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
            {tCommon('exploreDepartment')}
          </span>
        </div>
      </div>
    </section>
  )
}
