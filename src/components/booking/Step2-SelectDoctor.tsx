'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { ClockIcon, UserCircleIcon } from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/utils'
import {
  TIME_SLOTS,
  formatTimeSlot,
  doctorDisplayName,
  type Locale,
  type TimeSlot,
  type WizardDepartment,
  type WizardDoctor,
} from './BookingWizard'

type Props = {
  department: WizardDepartment
  doctors: WizardDoctor[]
  locale: Locale
  selectedDoctor: WizardDoctor | null
  selectedSlot: TimeSlot | null
  onPickDoctor: (d: WizardDoctor) => void
  onPickSlot: (s: TimeSlot) => void
  headingRef: React.RefObject<HTMLHeadingElement | null>
  showErrors: boolean
}

export function Step2SelectDoctor({
  department,
  doctors,
  locale,
  selectedDoctor,
  selectedSlot,
  onPickDoctor,
  onPickSlot,
  headingRef,
  showErrors,
}: Props) {
  const t = useTranslations('bookingWizard.step2')

  return (
    <div>
      <div className="text-center">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="font-semibold text-teal-deep text-[clamp(1.4rem,2.6vw,1.9rem)] focus:outline-none"
        >
          {t('title')}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {t('description', { department: department.name[locale] })}
        </p>
      </div>

      {/* Doctor picker */}
      <div className="mt-8">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-teal-deep">
          {t('doctorLabel')}
        </h3>

        {doctors.length === 0 ? (
          <p className="rounded-2xl border border-line bg-white p-6 text-center text-sm text-muted-foreground">
            {t('doctorsEmpty')}
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {doctors.map((d) => {
              const isSelected = selectedDoctor?._id === d._id
              const displayName = doctorDisplayName(d, locale)
              const specialty = d.specialty?.[locale] ?? ''
              return (
                <li key={d._id}>
                  <button
                    type="button"
                    onClick={() => onPickDoctor(d)}
                    aria-pressed={isSelected}
                    className={cn(
                      'flex h-full w-full items-center gap-3 rounded-2xl border bg-white p-4 text-start transition-all',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2',
                      isSelected
                        ? 'border-gold shadow-medium ring-2 ring-gold/40'
                        : 'border-line hover:-translate-y-0.5 hover:border-gold/60 hover:shadow-soft',
                    )}
                  >
                    <span className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full bg-cream ring-1 ring-line">
                      {d.photoUrl ? (
                        <Image
                          src={d.photoUrl}
                          alt={displayName}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : (
                        <UserCircleIcon
                          size={32}
                          weight="duotone"
                          className="text-teal-deep"
                          aria-hidden="true"
                        />
                      )}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="text-sm font-semibold leading-tight text-teal-deep">
                        {displayName}
                      </span>
                      {specialty && (
                        <span className="mt-1 text-[11px] text-muted-foreground">
                          {specialty}
                        </span>
                      )}
                      {typeof d.yearsExperience === 'number' &&
                        d.yearsExperience > 0 && (
                          <span className="mt-0.5 text-[11px] font-medium text-gold">
                            {t('yearsExperience', {
                              count: d.yearsExperience,
                            })}
                          </span>
                        )}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        {showErrors && !selectedDoctor && doctors.length > 0 && (
          <p className="mt-3 text-center text-xs font-medium text-red-600">
            {t('errorDoctor')}
          </p>
        )}
      </div>

      {/* Time slot picker */}
      <div className="mt-8">
        <h3 className="mb-3 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-deep">
          <ClockIcon size={14} weight="duotone" aria-hidden="true" />
          {t('timeLabel')}
        </h3>
        <ul className="mx-auto grid max-w-xl grid-cols-3 gap-2">
          {TIME_SLOTS.map((slot) => {
            const isSelected = selectedSlot === slot
            return (
              <li key={slot}>
                <button
                  type="button"
                  onClick={() => onPickSlot(slot)}
                  aria-pressed={isSelected}
                  className={cn(
                    'inline-flex w-full items-center justify-center rounded-lg border px-3 py-2.5 text-sm font-medium tabular-nums transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2',
                    isSelected
                      ? 'border-teal-deep bg-teal-deep text-cream-light'
                      : 'border-line bg-white text-teal-deep hover:border-teal-deep/40 hover:bg-cream',
                  )}
                >
                  <span dir="ltr">{formatTimeSlot(slot, locale)}</span>
                </button>
              </li>
            )
          })}
        </ul>

        {showErrors && !selectedSlot && (
          <p className="mt-3 text-center text-xs font-medium text-red-600">
            {t('errorSlot')}
          </p>
        )}
      </div>
    </div>
  )
}
