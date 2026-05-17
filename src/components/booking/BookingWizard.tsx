'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, type Variants } from 'motion/react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import { CaretRightIcon } from '@phosphor-icons/react/dist/ssr'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getWhatsAppUrl } from '@/lib/whatsapp'
import { Step1SelectService } from './Step1-SelectService'
import { Step2SelectDoctor } from './Step2-SelectDoctor'
import { Step3PatientInfo } from './Step3-PatientInfo'

/* ------------------------------------------------------------------ Types */

export type LocalizedString = { ar: string; en: string }

export type WizardService = {
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

export type WizardDepartment = {
  _id: string
  slug: string
  name: LocalizedString
  shortDescription?: LocalizedString | null
  icon?: string | null
  accentColor?: string | null
  isFeatured?: boolean | null
  services: WizardService[]
}

export type WizardDoctor = {
  _id: string
  slug: string
  name: LocalizedString
  titlePrefix?: LocalizedString | null
  specialty?: LocalizedString | null
  photoUrl?: string | null
  yearsExperience?: number | null
  departmentId: string
  departmentSlug: string
}

export type Locale = 'ar' | 'en'
export type Step = 1 | 2 | 3

/** Fixed grid of bookable hours — exposed for both the picker and the
 *  WhatsApp message label. */
export const TIME_SLOTS = [
  '09:00',
  '10:00',
  '11:00',
  '14:00',
  '15:00',
  '16:00',
] as const
export type TimeSlot = (typeof TIME_SLOTS)[number]

/** Pretty-print a 24h "HH:mm" slot for either locale. */
export function formatTimeSlot(slot: string, locale: Locale): string {
  const [h] = slot.split(':')
  const hour = Number(h)
  if (Number.isNaN(hour)) return slot
  const period = hour < 12 ? 'am' : 'pm'
  const twelve = hour % 12 === 0 ? 12 : hour % 12
  if (locale === 'ar') {
    return `${twelve}:00 ${period === 'am' ? 'صباحاً' : 'مساءً'}`
  }
  return `${twelve}:00 ${period === 'am' ? 'AM' : 'PM'}`
}

/* ------------------------------------------------------------------ Component */

type Props = {
  departments: WizardDepartment[]
  doctors: WizardDoctor[]
  initialDepartmentSlug?: string | null
  initialServiceSlug?: string | null
  initialDoctorSlug?: string | null
  isSupport?: boolean
}

export function BookingWizard({
  departments,
  doctors,
  initialDepartmentSlug,
  initialServiceSlug,
  initialDoctorSlug,
  isSupport = false,
}: Props) {
  const t = useTranslations('bookingWizard')
  const locale = useLocale() as Locale
  const isRtl = locale === 'ar'
  const router = useRouter()
  const searchParams = useSearchParams()

  /* ------------------ Deep-link resolution ------------------ */

  const initialDept = useMemo(
    () =>
      initialDepartmentSlug
        ? (departments.find((d) => d.slug === initialDepartmentSlug) ?? null)
        : null,
    [departments, initialDepartmentSlug],
  )

  const initialService = useMemo(() => {
    if (!initialDept || !initialServiceSlug) return null
    return (
      initialDept.services.find((s) => s.slug === initialServiceSlug) ?? null
    )
  }, [initialDept, initialServiceSlug])

  const initialDoctor = useMemo(() => {
    if (!initialDoctorSlug) return null
    if (initialDept) {
      return (
        doctors.find(
          (d) =>
            d.slug === initialDoctorSlug && d.departmentId === initialDept._id,
        ) ?? null
      )
    }
    return doctors.find((d) => d.slug === initialDoctorSlug) ?? null
  }, [doctors, initialDept, initialDoctorSlug])

  const initialStep: Step = isSupport
    ? 3
    : initialDept && initialService
      ? initialDoctor
        ? 3
        : 2
      : 1

  /* ------------------ State ------------------ */

  const [step, setStep] = useState<Step>(initialStep)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [department, setDepartment] = useState<WizardDepartment | null>(
    initialDept,
  )
  const [service, setService] = useState<WizardService | null>(initialService)
  const [doctor, setDoctor] = useState<WizardDoctor | null>(initialDoctor)
  const [timeSlot, setTimeSlot] = useState<TimeSlot | null>(null)
  const [patientName, setPatientName] = useState('')
  const [patientPhone, setPatientPhone] = useState('')
  const [patientEmail, setPatientEmail] = useState('')
  const [sending, setSending] = useState(false)

  // Track validation state for the current step's "Next" button.
  const [showErrors, setShowErrors] = useState(false)

  const stepHeadingRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    stepHeadingRef.current?.focus()
  }, [step])

  /* ------------------ Filtered data ------------------ */

  const availableDoctors = useMemo(() => {
    if (!department) return []
    return doctors.filter((d) => d.departmentId === department._id)
  }, [doctors, department])

  /* ------------------ URL sync ------------------ */

  const syncUrl = useCallback(
    (
      nextDept: WizardDepartment | null,
      nextSvc: WizardService | null,
      nextDoc: WizardDoctor | null,
    ) => {
      const params = new URLSearchParams(searchParams?.toString() ?? '')
      if (nextDept) params.set('department', nextDept.slug)
      else params.delete('department')
      if (nextSvc) params.set('service', nextSvc.slug)
      else params.delete('service')
      if (nextDoc) params.set('doctor', nextDoc.slug)
      else params.delete('doctor')
      const qs = params.toString()
      router.replace(`/${locale}/book${qs ? `?${qs}` : ''}`, { scroll: false })
    },
    [locale, router, searchParams],
  )

  /* ------------------ Step transitions ------------------ */

  const goTo = useCallback((next: Step, dir: 1 | -1) => {
    setDirection(dir)
    setStep(next)
    setShowErrors(false)
  }, [])

  /* Step 1 handlers */
  const handlePickDepartment = useCallback(
    (d: WizardDepartment) => {
      setDepartment(d)
      setService(null)
      setDoctor(null)
      syncUrl(d, null, null)
    },
    [syncUrl],
  )

  const handlePickService = useCallback(
    (s: WizardService) => {
      setService(s)
      syncUrl(department, s, doctor)
    },
    [department, doctor, syncUrl],
  )

  /* Step 2 handlers */
  const handlePickDoctor = useCallback(
    (d: WizardDoctor) => {
      setDoctor(d)
      syncUrl(department, service, d)
    },
    [department, service, syncUrl],
  )

  const handlePickSlot = useCallback((slot: TimeSlot) => {
    setTimeSlot(slot)
  }, [])

  /* Step 3 fields */
  const handleNameChange = useCallback((v: string) => setPatientName(v), [])
  const handlePhoneChange = useCallback((v: string) => setPatientPhone(v), [])
  const handleEmailChange = useCallback((v: string) => setPatientEmail(v), [])

  /* ------------------ Validation ------------------ */

  const step1Valid = !!department && !!service
  const step2Valid = !!doctor && !!timeSlot
  const nameValid = patientName.trim().length >= 2
  const phoneValid = isValidSaudiPhone(patientPhone)
  const emailValid = !patientEmail || isValidEmail(patientEmail)
  const step3Valid = nameValid && phoneValid && emailValid

  /* ------------------ Navigation ------------------ */

  const handleNext = useCallback(() => {
    if (step === 1) {
      if (!step1Valid) {
        setShowErrors(true)
        toast.error(t('errors.step1'))
        return
      }
      goTo(2, 1)
    } else if (step === 2) {
      if (!step2Valid) {
        setShowErrors(true)
        toast.error(t('errors.step2'))
        return
      }
      goTo(3, 1)
    }
  }, [step, step1Valid, step2Valid, goTo, t])

  const handleBack = useCallback(() => {
    if (step === 3) goTo(2, -1)
    else if (step === 2) goTo(1, -1)
  }, [step, goTo])

  /* ------------------ Submit ------------------ */

  const submitHref = useMemo(() => {
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
      doctor: doctor
        ? {
            name: doctorDisplayName(doctor, locale),
            specialty: doctor.specialty?.[locale] ?? undefined,
          }
        : null,
      timeSlot: timeSlot ? formatTimeSlot(timeSlot, locale) : null,
      customerName: patientName,
      customerPhone: patientPhone,
      customerEmail: patientEmail || null,
    })
  }, [
    locale,
    department,
    service,
    doctor,
    timeSlot,
    patientName,
    patientPhone,
    patientEmail,
  ])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (!step3Valid) {
        setShowErrors(true)
        if (!nameValid) toast.error(t('errors.name'))
        else if (!phoneValid) toast.error(t('errors.phone'))
        else if (!emailValid) toast.error(t('errors.email'))
        return
      }
      setSending(true)
      window.setTimeout(() => {
        window.open(submitHref, '_blank', 'noopener,noreferrer')
        setSending(false)
      }, 200)
    },
    [step3Valid, nameValid, phoneValid, emailValid, submitHref, t],
  )

  /* ------------------ Motion ------------------ */

  const physical = (dir: 1 | -1) => (isRtl ? -dir : dir)
  const variants: Variants = {
    enter: (dir: 1 | -1) => ({ x: physical(dir) * 60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: 1 | -1) => ({ x: physical(dir) * -60, opacity: 0 }),
  }

  /* ------------------ Render ------------------ */

  return (
    <div className="mx-auto w-full max-w-3xl">
      <ProgressIndicator step={step} t={t} />

      <Breadcrumb
        locale={locale}
        department={department}
        service={service}
        doctor={doctor}
        timeSlot={timeSlot}
      />

      <div className="relative mt-6 min-h-[28rem] overflow-hidden">
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
              <Step1SelectService
                departments={departments}
                locale={locale}
                selectedDepartment={department}
                selectedService={service}
                onPickDepartment={handlePickDepartment}
                onPickService={handlePickService}
                headingRef={stepHeadingRef}
                showErrors={showErrors}
              />
            )}

            {step === 2 && department && (
              <Step2SelectDoctor
                department={department}
                doctors={availableDoctors}
                locale={locale}
                selectedDoctor={doctor}
                selectedSlot={timeSlot}
                onPickDoctor={handlePickDoctor}
                onPickSlot={handlePickSlot}
                headingRef={stepHeadingRef}
                showErrors={showErrors}
              />
            )}

            {step === 3 && (
              <Step3PatientInfo
                name={patientName}
                phone={patientPhone}
                email={patientEmail}
                onNameChange={handleNameChange}
                onPhoneChange={handlePhoneChange}
                onEmailChange={handleEmailChange}
                onSubmit={handleSubmit}
                sending={sending}
                headingRef={stepHeadingRef}
                showErrors={showErrors}
                nameValid={nameValid}
                phoneValid={phoneValid}
                emailValid={emailValid}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation bar */}
      <div className="mt-6 flex items-center justify-between gap-3">
        {step > 1 ? (
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

        {step < 3 && (
          <Button
            type="button"
            onClick={handleNext}
            className={cn(
              'h-11 rounded-lg bg-teal-deep px-5 text-sm text-cream-light hover:bg-teal',
              (step === 1 ? !step1Valid : !step2Valid) &&
                'opacity-60 hover:bg-teal-deep',
            )}
          >
            {step === 1 ? t('nextStep2') : t('nextStep3')}
            <CaretRightIcon
              size={16}
              weight="bold"
              aria-hidden="true"
              className="ms-1.5 rtl:rotate-180"
            />
          </Button>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ Sub-bits */

function ProgressIndicator({
  step,
  t,
}: {
  step: Step
  t: ReturnType<typeof useTranslations>
}) {
  const dots: Step[] = [1, 2, 3]
  return (
    <div className="flex flex-col items-center gap-3">
      <span
        className="text-xs font-semibold uppercase tracking-[0.18em] text-gold"
        aria-live="polite"
      >
        {t('progress', { current: step, total: 3 })}
      </span>
      <ol className="flex items-center gap-2">
        {dots.map((n) => {
          const state = n < step ? 'done' : n === step ? 'current' : 'future'
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
                  state === 'current' &&
                    'ring-2 ring-gold/40 ring-offset-2 ring-offset-cream-light',
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

function Breadcrumb({
  locale,
  department,
  service,
  doctor,
  timeSlot,
}: {
  locale: Locale
  department: WizardDepartment | null
  service: WizardService | null
  doctor: WizardDoctor | null
  timeSlot: TimeSlot | null
}) {
  const parts: string[] = []
  if (department) parts.push(department.name[locale])
  if (service) parts.push(service.name[locale])
  if (doctor) parts.push(doctorDisplayName(doctor, locale))
  if (timeSlot) parts.push(formatTimeSlot(timeSlot, locale))

  if (parts.length === 0) return null

  return (
    <p className="mx-auto mt-5 flex max-w-2xl flex-wrap items-center justify-center gap-x-1.5 gap-y-1 rounded-full bg-cream px-4 py-2 text-center text-[11px] font-medium text-teal-deep">
      {parts.map((p, i) => (
        <span key={`${p}-${i}`} className="inline-flex items-center gap-1.5">
          {i > 0 && <span className="text-gold">›</span>}
          <span>{p}</span>
        </span>
      ))}
    </p>
  )
}

/* ------------------------------------------------------------------ Helpers */

export function doctorDisplayName(doc: WizardDoctor, locale: Locale): string {
  const title = doc.titlePrefix?.[locale]?.trim()
  const name = doc.name?.[locale]?.trim() ?? ''
  return title ? `${title} ${name}` : name
}

/** Saudi mobile phone formats: `+9665XXXXXXXX`, `9665XXXXXXXX`,
 *  `05XXXXXXXX`, `5XXXXXXXX`. Spaces/dashes tolerated. */
function isValidSaudiPhone(raw: string): boolean {
  const cleaned = raw.replace(/[\s-]/g, '')
  if (!cleaned) return false
  return /^(?:\+?966|0)?5\d{8}$/.test(cleaned)
}

function isValidEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw.trim())
}
