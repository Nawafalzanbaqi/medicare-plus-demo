'use client'

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import {
  CalendarCheckIcon,
  CaretDownIcon,
  ClockIcon,
  SunIcon,
  MoonIcon,
  WhatsappLogoIcon,
  XIcon,
} from '@phosphor-icons/react/dist/ssr'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { getBookingFlowUrl, getWhatsAppUrl } from '@/lib/whatsapp'

type LocalizedString = { ar: string; en: string }

type ApiService = { _id: string; slug: string; name: LocalizedString }
type ApiDepartment = {
  _id: string
  slug: string
  name: LocalizedString
  services: ApiService[]
}

type ApiResponse = {
  departments: ApiDepartment[]
  servicesByDepartmentSlug?: Record<string, ApiService[]>
}

type TimeSlot = 'morning' | 'evening' | 'any'

const STORAGE_KEYS = {
  expanded: 'qbb:isExpanded',
  hidden: 'qbb:dismissed',
} as const

const PATH_DENYLIST = ['/studio']

function shouldRender(pathname: string | null): boolean {
  if (!pathname) return true
  return !PATH_DENYLIST.some((p) => pathname.startsWith(p))
}

const subscribeNoop = () => () => {}

/** Reads `sessionStorage[qbb:dismissed]` without triggering an effect.
 *  `useSyncExternalStore` returns `null` during SSR (via getServerSnapshot)
 *  and the real value after hydration — no setState-in-effect needed. */
function useIsDismissed(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    () => {
      try {
        return sessionStorage.getItem(STORAGE_KEYS.hidden) === '1' ? 'y' : 'n'
      } catch {
        return 'n'
      }
    },
    () => null,
  ) === 'y'
}

/** Tracks whether we're hydrated on the client (true after first render). */
function useHasMounted(): boolean {
  return useSyncExternalStore(subscribeNoop, () => true, () => false)
}

function buildWhatsAppHref(args: {
  locale: 'ar' | 'en'
  department: ApiDepartment | null
  service: ApiService | null
  timeSlot: TimeSlot
  name: string
  phone: string
}): string {
  const { locale, department, service, timeSlot, name, phone } = args
  return getWhatsAppUrl({
    type: 'booking',
    locale,
    department: department
      ? { slug: department.slug, name: department.name[locale] }
      : null,
    service: service
      ? { slug: service.slug, name: service.name[locale] }
      : null,
    timePreference: timeSlot,
    customerName: name,
    customerPhone: phone,
  })
}

export function QuickBookingBar() {
  const t = useTranslations('quickBooking')
  const locale = useLocale() as 'ar' | 'en'
  const pathname = usePathname()
  const enabled = shouldRender(pathname)

  const mounted = useHasMounted()
  const persistedDismissed = useIsDismissed()
  const [localDismissed, setLocalDismissed] = useState(false)
  const dismissed = persistedDismissed || localDismissed
  const [expanded, setExpanded] = useState(false)
  const [nearFooter, setNearFooter] = useState(false)
  const [departments, setDepartments] = useState<ApiDepartment[]>([])
  const [servicesBySlug, setServicesBySlug] = useState<
    Record<string, ApiService[]>
  >({})
  const [loaded, setLoaded] = useState(false)

  // Booking selections
  const [departmentId, setDepartmentId] = useState<string>('')
  const [serviceId, setServiceId] = useState<string>('')
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('any')
  const [showContact, setShowContact] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [sending, setSending] = useState(false)

  const cardRef = useRef<HTMLDivElement>(null)

  // Lazy-load booking options. Async work in an effect with an in-flight
  // guard avoids the "setState directly in effect" anti-pattern.
  useEffect(() => {
    if (!enabled || dismissed || loaded) return
    let cancelled = false
    void (async () => {
      try {
        const res = await fetch('/api/booking-options', { cache: 'force-cache' })
        if (!res.ok) throw new Error(`status ${res.status}`)
        const data: ApiResponse = await res.json()
        if (cancelled) return
        setDepartments(data.departments ?? [])
        setServicesBySlug(data.servicesByDepartmentSlug ?? {})
      } catch {
        if (cancelled) return
        setDepartments([])
        setServicesBySlug({})
      } finally {
        if (!cancelled) setLoaded(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [enabled, dismissed, loaded])

  // Hide when near the page footer to avoid overlap.
  useEffect(() => {
    if (!enabled || dismissed) return
    const footer = document.querySelector('footer')
    if (!footer) return

    const observer = new IntersectionObserver(
      ([entry]) => setNearFooter(entry.isIntersecting),
      { rootMargin: '0px 0px -20% 0px' },
    )
    observer.observe(footer)
    return () => observer.disconnect()
  }, [enabled, dismissed])

  // Close on Escape when expanded.
  useEffect(() => {
    if (!expanded) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [expanded])

  const handleToggle = useCallback(() => {
    setExpanded((prev) => {
      const next = !prev
      try {
        sessionStorage.setItem(STORAGE_KEYS.expanded, next ? '1' : '0')
      } catch {}
      return next
    })
  }, [])

  const handleDismiss = useCallback(() => {
    setExpanded(false)
    setLocalDismissed(true)
    try {
      sessionStorage.setItem(STORAGE_KEYS.hidden, '1')
    } catch {}
  }, [])

  const selectedDept = useMemo(
    () => departments.find((d) => d._id === departmentId) ?? null,
    [departments, departmentId],
  )
  // Resolve services with a slug-based fallback in case the inline
  // `department.services[]` array is empty due to a Sanity authoring
  // mismatch (services referencing this dept but the dept's services
  // field wasn't populated). This was the QuickBookingBar bug where
  // selecting "قسم التجميل" showed "لا توجد خدمات" even though "فيلر الشفاه"
  // existed in Sanity.
  const availableServices = useMemo<ApiService[]>(() => {
    const inline = selectedDept?.services ?? []
    if (inline.length > 0) return inline
    if (!selectedDept) return []
    return servicesBySlug[selectedDept.slug] ?? []
  }, [selectedDept, servicesBySlug])
  const selectedService = useMemo(
    () => availableServices.find((s) => s._id === serviceId) ?? null,
    [availableServices, serviceId],
  )

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      setSending(true)
      const url = buildWhatsAppHref({
        locale,
        department: selectedDept,
        service: selectedService,
        timeSlot,
        name,
        phone,
      })
      // Brief delay for optimistic feedback.
      window.setTimeout(() => {
        window.open(url, '_blank', 'noopener,noreferrer')
        setSending(false)
      }, 200)
    },
    [locale, selectedDept, selectedService, timeSlot, name, phone],
  )

  const fullFormHref = useMemo(
    () =>
      getBookingFlowUrl({
        departmentSlug: selectedDept?.slug ?? undefined,
        serviceSlug: selectedService?.slug ?? undefined,
      }),
    [selectedDept, selectedService],
  )

  if (!mounted || !enabled || dismissed || nearFooter) return null

  return (
    <div
      className={cn(
        'fixed bottom-4 z-40 w-[calc(100vw-1.5rem)] max-w-[380px]',
        'sm:bottom-6',
      )}
      style={{ insetInlineEnd: '1rem' }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {expanded ? (
          <motion.div
            key="expanded"
            ref={cardRef}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.65, 0, 0.35, 1] }}
            className="overflow-hidden rounded-2xl border border-line bg-white shadow-strong"
            role="dialog"
            aria-modal="false"
            aria-label={t('title')}
          >
            <header className="flex items-center justify-between gap-3 bg-teal-deep px-4 py-3 text-cream-light">
              <div className="flex items-center gap-2">
                <CalendarCheckIcon
                  size={20}
                  weight="duotone"
                  className="text-gold"
                  aria-hidden="true"
                />
                <h3 className="text-sm font-semibold leading-tight">
                  {t('title')}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleToggle}
                aria-label={t('close')}
                className="rounded-full p-1 text-cream-light/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
              >
                <XIcon size={18} weight="bold" aria-hidden="true" />
              </button>
            </header>

            <form onSubmit={handleSubmit} className="space-y-3 px-4 py-4">
              <Field
                label={t('departmentLabel')}
                htmlFor="qbb-department"
              >
                <select
                  id="qbb-department"
                  value={departmentId}
                  onChange={(e) => {
                    setDepartmentId(e.target.value)
                    setServiceId('')
                  }}
                  className="w-full appearance-none rounded-lg border border-line bg-cream-light/60 px-3 py-2 text-sm text-ink focus:border-teal-deep focus:outline-none"
                >
                  <option value="">{t('departmentPlaceholder')}</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name?.[locale] ?? d.slug}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label={t('serviceLabel')} htmlFor="qbb-service">
                <select
                  id="qbb-service"
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  disabled={!departmentId || availableServices.length === 0}
                  className="w-full appearance-none rounded-lg border border-line bg-cream-light/60 px-3 py-2 text-sm text-ink focus:border-teal-deep focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">
                    {availableServices.length === 0 && departmentId
                      ? t('noServices')
                      : t('servicePlaceholder')}
                  </option>
                  {availableServices.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name?.[locale] ?? s.slug}
                    </option>
                  ))}
                </select>
              </Field>

              <fieldset>
                <legend className="mb-1.5 block text-xs font-semibold text-teal-deep">
                  {t('timeLabel')}
                </legend>
                <div className="flex flex-wrap gap-1.5">
                  <TimePill
                    selected={timeSlot === 'morning'}
                    onClick={() => setTimeSlot('morning')}
                    icon={<SunIcon size={14} weight="duotone" aria-hidden="true" />}
                  >
                    {t('slots.morning')}
                  </TimePill>
                  <TimePill
                    selected={timeSlot === 'evening'}
                    onClick={() => setTimeSlot('evening')}
                    icon={<MoonIcon size={14} weight="duotone" aria-hidden="true" />}
                  >
                    {t('slots.evening')}
                  </TimePill>
                  <TimePill
                    selected={timeSlot === 'any'}
                    onClick={() => setTimeSlot('any')}
                    icon={<ClockIcon size={14} weight="duotone" aria-hidden="true" />}
                  >
                    {t('slots.any')}
                  </TimePill>
                </div>
              </fieldset>

              <div>
                <button
                  type="button"
                  onClick={() => setShowContact((v) => !v)}
                  className="flex w-full items-center justify-between text-xs font-medium text-muted hover:text-teal-deep"
                  aria-expanded={showContact}
                >
                  <span>{t('contactToggle')}</span>
                  <CaretDownIcon
                    size={14}
                    weight="bold"
                    aria-hidden="true"
                    className={cn('transition-transform', showContact && 'rotate-180')}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {showContact && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2 pt-2">
                        <input
                          type="text"
                          inputMode="text"
                          autoComplete="name"
                          placeholder={t('namePlaceholder')}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full rounded-lg border border-line bg-cream-light/60 px-3 py-2 text-sm text-ink focus:border-teal-deep focus:outline-none"
                        />
                        <input
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          dir="ltr"
                          placeholder={t('phonePlaceholder')}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full rounded-lg border border-line bg-cream-light/60 px-3 py-2 text-sm text-ink focus:border-teal-deep focus:outline-none"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                type="submit"
                disabled={sending}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] py-2.5 text-sm font-semibold text-white shadow-soft transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 disabled:cursor-wait disabled:opacity-80"
              >
                <WhatsappLogoIcon size={18} weight="fill" aria-hidden="true" />
                {sending ? t('sending') : t('submit')}
              </button>

              <div className="flex justify-center">
                <Link
                  href={fullFormHref}
                  onClick={() => setExpanded(false)}
                  className="text-[11px] font-medium text-teal-deep/80 underline-offset-2 transition-colors hover:text-teal-deep hover:underline"
                >
                  {t('fullFormLink')}
                </Link>
              </div>

              <div className="flex justify-center pt-1">
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="text-[11px] text-muted underline-offset-2 transition-colors hover:text-teal-deep hover:underline"
                >
                  {t('dismiss')}
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.button
            key="collapsed"
            type="button"
            onClick={handleToggle}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.3, ease: [0.65, 0, 0.35, 1] }}
            className="flex h-14 w-full items-center justify-between gap-3 rounded-2xl border border-line bg-teal-deep px-4 text-cream-light shadow-medium transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 sm:w-auto sm:min-w-[260px]"
            aria-label={t('openLabel')}
          >
            <span className="relative grid h-9 w-9 place-items-center rounded-full bg-gold/20 text-gold">
              <span
                aria-hidden="true"
                className="absolute inset-0 animate-ping rounded-full bg-gold/30"
              />
              <CalendarCheckIcon size={20} weight="duotone" aria-hidden="true" />
            </span>
            <span className="flex-1 text-start text-sm font-semibold">
              {t('cta')}
            </span>
            <CaretDownIcon
              size={14}
              weight="bold"
              aria-hidden="true"
              className="rtl:rotate-180 -rotate-90"
            />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-xs font-semibold text-teal-deep"
      >
        {label}
      </label>
      {children}
    </div>
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
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
        selected
          ? 'border-teal-deep bg-teal-deep text-cream-light'
          : 'border-line bg-cream-light/60 text-ink hover:border-teal-deep/40 hover:bg-cream',
      )}
    >
      {icon}
      {children}
    </button>
  )
}
