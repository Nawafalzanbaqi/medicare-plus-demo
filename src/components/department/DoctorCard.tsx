import { useTranslations } from 'next-intl'
import { AnimatedNumber } from '@/components/shared/AnimatedNumber'
import { BookButton } from '@/components/shared/BookButton'
import { SafeImage } from '@/components/shared/SafeImage'
import { Link } from '@/i18n/navigation'
import type { Doctor } from '@/lib/data'
import { getWhatsAppUrl } from '@/lib/whatsapp'

type Props = {
  doctor: Doctor
  locale: 'ar' | 'en'
}

export function DoctorCard({ doctor, locale }: Props) {
  const t = useTranslations('departments.common')

  const fullName = `${doctor.title[locale]} ${doctor.name[locale]}`
  const specialty = doctor.specialty[locale]

  const whatsappHref = getWhatsAppUrl({
    type: 'doctor-inquiry',
    locale,
    doctor: { name: fullName, specialty },
  })

  return (
    <article className="group flex h-full flex-col items-center rounded-2xl border border-line bg-white p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-soft">
      <SafeImage
        src={doctor.photo}
        alt={fullName}
        sizes="112px"
        aspect="square"
        wrapperClassName="h-28 w-28 rounded-full ring-2 ring-gold/30 ring-offset-4 ring-offset-white"
        rounded={false}
        locale={locale}
      />
      <h3 className="mt-5 text-lg font-semibold text-teal-deep">
        {doctor.slug ? (
          <Link
            href={`/doctors/${doctor.slug}`}
            className="transition-colors hover:text-gold"
          >
            {fullName}
          </Link>
        ) : (
          fullName
        )}
      </h3>
      <p className="mt-1 text-sm text-gold">{specialty}</p>
      <p className="mt-3 text-xs text-muted-foreground">
        <AnimatedNumber
          value={doctor.yearsExperience}
          className="text-base font-semibold text-teal-deep"
        />{' '}
        <span className="ms-1 uppercase tracking-wider">
          {t('yearsExperience')}
        </span>
      </p>
      <div className="mt-5 w-full">
        <BookButton
          href={whatsappHref}
          external
          label={t('bookWithDoctor')}
          size="md"
          ariaLabel={`${t('bookWithDoctor')} — ${fullName}`}
        />
      </div>
    </article>
  )
}
