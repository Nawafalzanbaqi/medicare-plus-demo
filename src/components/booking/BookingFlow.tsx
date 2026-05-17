'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { AnimatePresence, motion, type Variants } from 'motion/react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  CaretRightIcon,
  CalendarCheckIcon,
  ClockIcon,
  HeadsetIcon,
  MoonIcon,
  StethoscopeIcon,
  SunIcon,
  WhatsappLogoIcon,
} from '@phosphor-icons/react/dist/ssr'
import type { Icon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getWhatsAppUrl, type TimePreference } from '@/lib/whatsapp'

/* ------------------------------------------------------------------ Types */

type LocalizedString = { ar: string; en: string }

export type FlowService = {
  _id: string
  slug: string
  name: LocalizedString
  description?: LocalizedString | null
  icon?: string | null
  price?: number | null
  showPrice?: boolean | null
  duration?: LocalizedString | null
  isPopular?: boolean | null
}

export type FlowDepartment = {
  _id: string
  slug: string
  name: LocalizedString
  shortDescription?: LocalizedString | null
  icon?: string | null
  accentColor?: string | null
  isFeatured?: boolean | null
  services: FlowService[]
}

type Step = 1 | 2 | 3
type Locale = 'ar' | 'en'

type Props = {
  departments: FlowDepartment[]
  /** Pre-filled department slug from `?department=...`. */
  initialDepartmentSlug?: string | null
  /** Pre-filled service slug from `?service=...`. */
  initialServiceSlug?: string | null
  /** Switch to support mode (different wording, no service step). */
  isSupport?: boolean
}

/* ------------------------------------------------------------------ Icons */

import {
  BabyIcon,
  BoneIcon,
  DropIcon,
  EarIcon,
  EyeIcon,
  FirstAidIcon,
  FlaskIcon,
  FlowerIcon,
  HandSoapIcon,
  HeartIcon,
  ImageIcon,
  LeafIcon,
  LightningIcon,
  ScissorsIcon,
  ShieldCheckIcon,
  SparkleIcon,
  SpeakerHighIcon,
  SyringeIcon,
  ToothIcon,
  UserCircleIcon,
  WrenchIcon,
  HeadphonesIcon,
} from '@phosphor-icons/react/dist/ssr'

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

/* ------------------------------------------------------------------ Main */

export function BookingFlow({
  departments,
  initialDepartmentSlug,
  initialServiceSlug,
  isSupport = false,
}: Props) {
  const t = useTranslations('bookingFlow')
  const locale = useLocale() as Locale
  const isRtl = locale === 'ar'
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialDept = useMemo(
    () =>
      initialDepartmentSlug
        ? (departments.find((d) => d.slug === initialDepartmentSlug) ?? null)
        : null,
    [departments, initialDepartmentSlug],
  )

  const initialService = useMemo(() => {
    if (!initialDept || !initialServiceSlug) return null
    return initialDept.services.find((s) => s.slug === initialServiceSlug) ?? null
  }, [initialDept, initialServiceSlug])

  const initialStep: Step = isSupport
    ? 3
    : initialDept && initialService
      ? 3
      : initialDept
        ? 2
        : 1

  const [step, setStep] = useState<Step>(initialStep)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [department, setDepartment] = useState<FlowDepartment | null>(initialDept)
  const [service, setService] = useState<FlowService | null>(initialService)
  const [time, setTime] = useState<TimePreference>('any')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [sending, setSending] = useState(false)

  const stepHeadingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    // Move focus to the step heading whenever we land on a new step so
    // screen readers announce the change.
    stepHeadingRef.current?.focus()
  }, [step])

  /* ------- URL sync (so refreshes preserve the user's progress) ------- */

  const syncUrl = useCallback(
    (nextDept: FlowDepartment | null, nextSvc: FlowService | null) => {
      const params = new URLSearchParams(searchParams?.toString() ?? '')
      if (nextDept) params.set('department', nextDept.slug)
      else params.delete('department')
      if (nextSvc) params.set('service', nextSvc.slug)
      else params.delete('service')
      const qs = params.toString()
      const href = qs ? `?${qs}` : ''
      router.replace(`/${locale}/book${href}`, { scroll: false })
    },
    [locale, router, searchParams],
  )

  /* ------- Step transitions ------- */

  const goTo = useCallback((next: Step, dir: 1 | -1) => {
    setDirection(dir)
    setStep(next)
  }, [])

  const handlePickDepartment = useCallback(
    (d: FlowDepartment) => {
      setDepartment(d)
      setService(null)
      syncUrl(d, null)
      // If the department has zero services, jump straight to step 3 so
      // the user can still book without picking a service.
      goTo(d.services.length === 0 ? 3 : 2, 1)
    },
    [goTo, syncUrl],
  )

  const handlePickService = useCallback(
    (s: FlowService) => {
      setService(s)
      syncUrl(department, s)
      goTo(3, 1)
    },
    [department, goTo, syncUrl],
  )

  const handleBack = useCallback(() => {
    if (step === 3) {
      const dest: Step = department && department.services.length > 0 ? 2 : 1
      goTo(dest, -1)
    } else if (step === 2) {
      goTo(1, -1)
    }
  }, [step, department, goTo])

  /* ------- Submit → WhatsApp ------- */

  const submitHref = useMemo(() => {
    if (isSupport) {
      return getWhatsAppUrl({
        type: 'support',
        locale,
        supportType: department?.name?.[locale] ?? undefined,
        customerName: name,
        customerPhone: phone,
        notes,
      })
    }
    return getWhatsAppUrl({
      type: 'booking',
      locale,
      department: department
        ? { slug: department.slug, name: department.name[locale] }
        : null,
      service: service
        ? {
            slug: service.slug,
            name: service.name[locale],
            price: service.showPrice ? (service.price ?? null) : null,
          }
        : null,
      timePreference: time,
      customerName: name,
      customerPhone: phone,
      notes,
    })
  }, [isSupport, locale, department, service, time, name, phone, notes])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      setSending(true)
      window.setTimeout(() => {
        window.open(submitHref, '_blank', 'noopener,noreferrer')
        setSending(false)
      }, 200)
    },
    [submitHref],
  )

  /* ------- Motion variants ------- */

  const physical = (dir: 1 | -1) => (isRtl ? -dir : dir)
  const variants: Variants = {
    enter: (dir: 1 | -1) => ({ x: physical(dir) * 60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: 1 | -1) => ({ x: physical(dir) * -60, opacity: 0 }),
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <ProgressIndicator step={step} t={t} />

      <div className="relative mt-8 min-h-[28rem] overflow-hidden">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.65, 0, 0.35, 1] }}
          >
            {step === 1 && (
              <Step1
                departments={departments}
                selected={department}
                locale={locale}
                onPick={handlePickDepartment}
                headingRef={stepHeadingRef}
              />
            )}

            {step === 2 && department && (
              <Step2
                department={department}
                selected={service}
                locale={locale}
                onPick={handlePickService}
                onSkip={() => goTo(3, 1)}
                headingRef={stepHeadingRef}
              />
            )}

            {step === 3 && (
              <Step3
                isSupport={isSupport}
                department={department}
                service={service}
                locale={locale}
                time={time}
                onTimeChange={setTime}
                name={name}
                onNameChange={setName}
                phone={phone}
                onPhoneChange={setPhone}
                notes={notes}
                onNotesChange={setNotes}
                sending={sending}
                onSubmit={handleSubmit}
                headingRef={stepHeadingRef}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        {step > 1 && !isSupport ? (
          <Button
            type="button"
            onClick={handleBack}
            variant="outline"
            className="h-11 rounded-lg border-line bg-white px-4 text-sm text-teal-deep hover:border-teal-deep/40"
          >
            <CaretRightIcon
              size={16}
              weight="bold"
              aria-hidden="true"
              className="me-1.5 rtl:rotate-0 rotate-180"
            />
            {t('back')}
          </Button>
        ) : (
          <span aria-hidden="true" />
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ Progress */

function ProgressIndicator({
  step,
  t,
}: {
  step: Step
  t: ReturnType<typeof useTranslations>
}) {
  const dots: Step[] = [1, 2, 3]
  return (
    <div className="flex flex-col items-center gap-3" aria-hidden="false">
      <span
        className="text-xs font-semibold uppercase tracking-[0.18em] text-gold"
        aria-live="polite"
      >
        {t('progress', { current: step, total: 3 })}
      </span>
      <ol className="flex items-center gap-2">
        {dots.map((n) => {
          const state =
            n < step ? 'done' : n === step ? 'current' : 'future'
          return (
            <li key={n} className="flex items-center">
              <motion.span
                aria-hidden="true"
                initial={false}
                animate={{
                  scale: state === 'current' ? 1.15 : 1,
                  backgroundColor:
                    state === 'done'
                      ? 'rgb(201,169,97)'
                      : state === 'current'
                        ? 'rgb(201,169,97)'
                        : 'rgba(13,62,62,0.18)',
                }}
                transition={{ duration: 0.3, ease: [0.65, 0, 0.35, 1] }}
                className={cn(
                  'block h-3 w-3 rounded-full',
                  state === 'current' && 'ring-2 ring-gold/40 ring-offset-2 ring-offset-cream-light',
                )}
              />
              {n < 3 && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'mx-1.5 h-px w-8 transition-colors',
                    n < step ? 'bg-gold' : 'bg-line',
                  )}
                />
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/* ------------------------------------------------------------------ Steps */

type StepHeadingProps = {
  refEl: React.RefObject<HTMLHeadingElement | null>
  title: string
  description: string
}

function StepHeading({ refEl, title, description }: StepHeadingProps) {
  return (
    <div className="text-center">
      <h2
        ref={refEl}
        tabIndex={-1}
        className="font-display-ar font-semibold text-teal-deep text-[clamp(1.4rem,2.6vw,1.9rem)] focus:outline-none"
      >
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        {description}
      </p>
    </div>
  )
}

function Step1({
  departments,
  selected,
  locale,
  onPick,
  headingRef,
}: {
  departments: FlowDepartment[]
  selected: FlowDepartment | null
  locale: Locale
  onPick: (d: FlowDepartment) => void
  headingRef: React.RefObject<HTMLHeadingElement | null>
}) {
  const t = useTranslations('bookingFlow.step1')
  return (
    <div>
      <StepHeading refEl={headingRef} title={t('title')} description={t('description')} />

      <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((d) => {
          const Icon = iconFor(d.icon)
          const isSelected = selected?._id === d._id
          const name = d.name?.[locale] || d.name?.en || d.name?.ar || ''
          const description =
            d.shortDescription?.[locale] || d.shortDescription?.en || ''
          return (
            <li key={d._id}>
              <button
                type="button"
                onClick={() => onPick(d)}
                aria-pressed={isSelected}
                className={cn(
                  'group/dept flex h-full w-full flex-col items-start gap-3 rounded-2xl border bg-white p-5 text-start transition-all',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2',
                  isSelected
                    ? 'border-gold shadow-medium ring-2 ring-gold/40'
                    : 'border-line hover:-translate-y-0.5 hover:border-gold/60 hover:shadow-soft',
                )}
              >
                <span
                  className="grid h-12 w-12 place-items-center rounded-xl bg-gold/10 ring-1 ring-gold/20 transition-colors group-hover/dept:bg-gold/20"
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
                <span className="mt-auto inline-flex items-center text-xs font-semibold text-gold">
                  {d.services.length > 0
                    ? `${d.services.length}+`
                    : ' '}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function Step2({
  department,
  selected,
  locale,
  onPick,
  onSkip,
  headingRef,
}: {
  department: FlowDepartment
  selected: FlowService | null
  locale: Locale
  onPick: (s: FlowService) => void
  onSkip: () => void
  headingRef: React.RefObject<HTMLHeadingElement | null>
}) {
  const t = useTranslations('bookingFlow.step2')
  const tCommon = useTranslations('bookingFlow.summary')
  const services = department.services
  const departmentName =
    department.name?.[locale] || department.name?.en || department.name?.ar || ''

  return (
    <div>
      <StepHeading
        refEl={headingRef}
        title={t('title')}
        description={t('description')}
      />

      <p className="mx-auto mt-4 inline-flex w-fit items-center justify-self-center rounded-full bg-cream px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-teal-deep ring-1 ring-line">
        <span className="me-1 text-gold">●</span>
        {tCommon('department')}: {departmentName}
      </p>

      {services.length === 0 ? (
        <div className="mx-auto mt-8 max-w-md rounded-2xl border border-line bg-white p-8 text-center shadow-soft">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {t('empty')}
          </p>
          <Button
            type="button"
            onClick={onSkip}
            className="mt-5 h-11 rounded-lg bg-teal-deep px-5 text-cream-light hover:bg-teal"
          >
            <HeadsetIcon size={16} weight="duotone" aria-hidden="true" className="me-2" />
            {t('skipNote')}
          </Button>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {services.map((s) => {
            const Icon = iconFor(s.icon)
            const isSelected = selected?._id === s._id
            const name = s.name?.[locale] || s.name?.en || s.name?.ar || ''
            const duration =
              s.duration?.[locale] || s.duration?.en || s.duration?.ar || null
            return (
              <li key={s._id}>
                <button
                  type="button"
                  onClick={() => onPick(s)}
                  aria-pressed={isSelected}
                  className={cn(
                    'group/svc flex h-full w-full items-start gap-3 rounded-2xl border bg-white p-5 text-start transition-all',
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
                        <span className="font-semibold text-teal-deep tabular-nums">
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
                  <span className="mt-1 ms-2 inline-flex items-center rounded-full bg-teal-deep/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-deep">
                    {t('selectButton')}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function Step3({
  isSupport,
  department,
  service,
  locale,
  time,
  onTimeChange,
  name,
  onNameChange,
  phone,
  onPhoneChange,
  notes,
  onNotesChange,
  sending,
  onSubmit,
  headingRef,
}: {
  isSupport: boolean
  department: FlowDepartment | null
  service: FlowService | null
  locale: Locale
  time: TimePreference
  onTimeChange: (t: TimePreference) => void
  name: string
  onNameChange: (v: string) => void
  phone: string
  onPhoneChange: (v: string) => void
  notes: string
  onNotesChange: (v: string) => void
  sending: boolean
  onSubmit: (e: React.FormEvent) => void
  headingRef: React.RefObject<HTMLHeadingElement | null>
}) {
  const t = useTranslations('bookingFlow.step3')
  const tFields = useTranslations('bookingFlow.fields')
  const tTime = useTranslations('bookingFlow.timePreference')
  const tFlow = useTranslations('bookingFlow')
  const tSupport = useTranslations('bookingFlow.support')
  const tSummary = useTranslations('bookingFlow.summary')

  const title = isSupport ? tSupport('title') : t('title')
  const description = isSupport ? tSupport('description') : t('description')

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <StepHeading refEl={headingRef} title={title} description={description} />

      {(department || service) && !isSupport && (
        <div className="mx-auto flex max-w-md flex-wrap items-center justify-center gap-2">
          {department && (
            <Chip>
              <span className="text-muted-foreground">{tSummary('department')}:</span>{' '}
              <strong className="text-teal-deep">
                {department.name[locale]}
              </strong>
            </Chip>
          )}
          {service && (
            <Chip>
              <span className="text-muted-foreground">{tSummary('service')}:</span>{' '}
              <strong className="text-teal-deep">{service.name[locale]}</strong>
            </Chip>
          )}
        </div>
      )}

      {!isSupport && (
        <fieldset className="mx-auto max-w-xl">
          <legend className="mb-2 block text-center text-xs font-semibold uppercase tracking-wider text-teal-deep">
            {tTime('label')}
          </legend>
          <div className="flex flex-wrap justify-center gap-2">
            <TimePill
              selected={time === 'morning'}
              onClick={() => onTimeChange('morning')}
              icon={<SunIcon size={16} weight="duotone" aria-hidden="true" />}
            >
              {tTime('morning')}
            </TimePill>
            <TimePill
              selected={time === 'evening'}
              onClick={() => onTimeChange('evening')}
              icon={<MoonIcon size={16} weight="duotone" aria-hidden="true" />}
            >
              {tTime('evening')}
            </TimePill>
            <TimePill
              selected={time === 'any'}
              onClick={() => onTimeChange('any')}
              icon={<ClockIcon size={16} weight="duotone" aria-hidden="true" />}
            >
              {tTime('any')}
            </TimePill>
          </div>
        </fieldset>
      )}

      <div className="mx-auto grid max-w-xl gap-4 sm:grid-cols-2">
        <Field label={tFields('name')} htmlFor="bf-name">
          <input
            id="bf-name"
            type="text"
            value={name}
            autoComplete="name"
            onChange={(e) => onNameChange(e.target.value)}
            placeholder={tFields('namePlaceholder')}
            className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-teal-deep focus:outline-none"
          />
        </Field>
        <Field label={tFields('phone')} htmlFor="bf-phone">
          <input
            id="bf-phone"
            type="tel"
            value={phone}
            autoComplete="tel"
            dir="ltr"
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder={tFields('phonePlaceholder')}
            className="w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-teal-deep focus:outline-none"
          />
        </Field>
      </div>

      <div className="mx-auto max-w-xl">
        <Field label={tFields('notes')} htmlFor="bf-notes">
          <textarea
            id="bf-notes"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder={tFields('notesPlaceholder')}
            rows={3}
            className="w-full resize-y rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink focus:border-teal-deep focus:outline-none"
          />
        </Field>
      </div>

      <div className="flex justify-center pt-2">
        <button
          type="submit"
          disabled={sending}
          className={cn(
            'inline-flex h-12 min-w-[260px] items-center justify-center gap-2 rounded-lg bg-[#25D366] px-6 text-sm font-semibold text-white shadow-medium transition-transform',
            'hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 disabled:cursor-wait disabled:opacity-80',
          )}
        >
          <WhatsappLogoIcon size={20} weight="fill" aria-hidden="true" />
          {sending ? tFlow('sending') : isSupport ? tSupport('submit') : tFlow('submit')}
        </button>
      </div>
    </form>
  )
}

/* ------------------------------------------------------------------ Bits */

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-3 py-1.5 text-xs">
      {children}
    </span>
  )
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: ReactNode
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="mb-1.5 block text-xs font-semibold text-teal-deep">
        {label}
      </span>
      {children}
    </label>
  )
}

function TimePill({
  selected,
  onClick,
  icon,
  children,
}: {
  selected: boolean
  onClick: () => void
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
        selected
          ? 'border-teal-deep bg-teal-deep text-cream-light'
          : 'border-line bg-white text-teal-deep hover:border-teal-deep/40 hover:bg-cream',
      )}
    >
      {icon}
      {children}
    </button>
  )
}
