'use client'

import { useTranslations } from 'next-intl'
import type { Icon } from '@phosphor-icons/react'
import {
  BabyIcon,
  BoneIcon,
  CalendarCheckIcon,
  DropIcon,
  EarIcon,
  EyeIcon,
  FirstAidIcon,
  FlaskIcon,
  FlowerIcon,
  HandSoapIcon,
  HeadphonesIcon,
  HeartIcon,
  ImageIcon,
  LeafIcon,
  LightningIcon,
  ScissorsIcon,
  ShieldCheckIcon,
  SparkleIcon,
  SpeakerHighIcon,
  StethoscopeIcon,
  SyringeIcon,
  ToothIcon,
  UserCircleIcon,
  WrenchIcon,
  ClockIcon,
} from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/utils'
import type {
  Locale,
  WizardDepartment,
  WizardService,
} from './BookingWizard'

const ICON_MAP: Record<string, Icon> = {
  sparkle: SparkleIcon,
  stethoscope: StethoscopeIcon,
  syringe: SyringeIcon,
  drop: DropIcon,
  'hand-soap': HandSoapIcon,
  leaf: LeafIcon,
  lightning: LightningIcon,
  'first-aid': FirstAidIcon,
  scissors: ScissorsIcon,
  bone: BoneIcon,
  heart: HeartIcon,
  'shield-check': ShieldCheckIcon,
  'calendar-check': CalendarCheckIcon,
  ear: EarIcon,
  'speaker-high': SpeakerHighIcon,
  'user-circle': UserCircleIcon,
  baby: BabyIcon,
  wrench: WrenchIcon,
  headphones: HeadphonesIcon,
  tooth: ToothIcon,
  flower: FlowerIcon,
  eye: EyeIcon,
  flask: FlaskIcon,
  'x-ray': ImageIcon,
}

function iconFor(name?: string | null): Icon {
  if (!name) return SparkleIcon
  return ICON_MAP[name] ?? SparkleIcon
}

type Props = {
  departments: WizardDepartment[]
  locale: Locale
  selectedDepartment: WizardDepartment | null
  selectedService: WizardService | null
  onPickDepartment: (d: WizardDepartment) => void
  onPickService: (s: WizardService) => void
  headingRef: React.RefObject<HTMLHeadingElement | null>
  showErrors: boolean
}

export function Step1SelectService({
  departments,
  locale,
  selectedDepartment,
  selectedService,
  onPickDepartment,
  onPickService,
  headingRef,
  showErrors,
}: Props) {
  const t = useTranslations('bookingWizard.step1')

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
          {t('description')}
        </p>
      </div>

      {/* Department picker */}
      <div className="mt-8">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-teal-deep">
          {t('departmentLabel')}
        </h3>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((d) => {
            const Icon = iconFor(d.icon)
            const isSelected = selectedDepartment?._id === d._id
            const name = d.name?.[locale] || d.name?.en || d.name?.ar || ''
            const description =
              d.shortDescription?.[locale] || d.shortDescription?.en || ''
            return (
              <li key={d._id}>
                <button
                  type="button"
                  onClick={() => onPickDepartment(d)}
                  aria-pressed={isSelected}
                  className={cn(
                    'group flex h-full w-full flex-col items-start gap-3 rounded-2xl border bg-white p-5 text-start transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2',
                    isSelected
                      ? 'border-gold shadow-medium ring-2 ring-gold/40'
                      : 'border-line hover:-translate-y-0.5 hover:border-gold/60 hover:shadow-soft',
                  )}
                >
                  <span
                    className="grid h-12 w-12 place-items-center rounded-xl bg-gold/10 ring-1 ring-gold/20 transition-colors group-hover:bg-gold/20"
                    style={
                      d.accentColor
                        ? {
                            backgroundColor: `${d.accentColor}1A`,
                            boxShadow: `inset 0 0 0 1px ${d.accentColor}33`,
                          }
                        : undefined
                    }
                  >
                    <Icon size={24} weight="duotone" className="text-teal-deep" />
                  </span>
                  <span className="text-base font-semibold leading-tight text-teal-deep">
                    {name}
                  </span>
                  {description && (
                    <span className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {description}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
        {showErrors && !selectedDepartment && (
          <p className="mt-3 text-center text-xs font-medium text-red-600">
            {t('errorDepartment')}
          </p>
        )}
      </div>

      {/* Service picker (shown once a dept is chosen) */}
      {selectedDepartment && (
        <div className="mt-10">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-teal-deep">
            {t('serviceLabel')}
          </h3>

          {selectedDepartment.services.length === 0 ? (
            <p className="rounded-2xl border border-line bg-white p-6 text-center text-sm text-muted-foreground">
              {t('servicesEmpty')}
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {selectedDepartment.services.map((s) => {
                const Icon = iconFor(s.icon)
                const isSelected = selectedService?._id === s._id
                const name = s.name?.[locale] || s.name?.en || s.name?.ar || ''
                const duration =
                  s.duration?.[locale] || s.duration?.en || s.duration?.ar || null
                return (
                  <li key={s._id}>
                    <button
                      type="button"
                      onClick={() => onPickService(s)}
                      aria-pressed={isSelected}
                      className={cn(
                        'flex h-full w-full items-start gap-3 rounded-2xl border bg-white p-4 text-start transition-all',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2',
                        isSelected
                          ? 'border-gold shadow-medium ring-2 ring-gold/40'
                          : 'border-line hover:-translate-y-0.5 hover:border-gold/60 hover:shadow-soft',
                      )}
                    >
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold/10 ring-1 ring-gold/20">
                        <Icon size={22} weight="duotone" className="text-teal-deep" />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="text-sm font-semibold leading-tight text-teal-deep">
                          {name}
                        </span>
                        <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
                          {s.showPrice && typeof s.price === 'number' && (
                            <span className="font-semibold tabular-nums text-teal-deep">
                              {s.price} {locale === 'ar' ? 'ر.س' : 'SAR'}
                            </span>
                          )}
                          {duration && (
                            <span className="inline-flex items-center gap-1">
                              <ClockIcon size={12} weight="duotone" aria-hidden="true" />
                              {duration}
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          {showErrors && selectedDepartment && !selectedService && (
            <p className="mt-3 text-center text-xs font-medium text-red-600">
              {t('errorService')}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
