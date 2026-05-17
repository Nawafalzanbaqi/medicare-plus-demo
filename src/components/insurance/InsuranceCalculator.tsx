'use client'

import { createElement, useMemo, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion, type Variants } from 'motion/react'
import { Check, ChevronLeft, ChevronRight, Printer, RotateCcw } from 'lucide-react'
import { WhatsappLogoIcon } from '@phosphor-icons/react/dist/ssr'
import type { Icon } from '@phosphor-icons/react'
import {
  BabyIcon,
  BoneIcon,
  EarIcon,
  EyeIcon,
  FirstAidIcon,
  FlaskIcon,
  FlowerIcon,
  ImageIcon,
  SparkleIcon,
  StethoscopeIcon,
  ToothIcon,
} from '@phosphor-icons/react/dist/ssr'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { getWhatsAppUrl } from '@/lib/whatsapp'
import { urlForImage } from '@/sanity/lib/image'
import type { CoverageRule, InsuranceDoc, Locale } from '@/sanity/types'
import { cn } from '@/lib/utils'

const TOTAL_STEPS = 4
const DEFAULT_BRAND_COLOR = '#0d3e3e'

const DEPARTMENT_ICONS: Record<string, Icon> = {
  sparkle: SparkleIcon,
  'first-aid': FirstAidIcon,
  scalpel: FirstAidIcon,
  ear: EarIcon,
  tooth: ToothIcon,
  stethoscope: StethoscopeIcon,
  baby: BabyIcon,
  flower: FlowerIcon,
  bone: BoneIcon,
  eye: EyeIcon,
  flask: FlaskIcon,
  'x-ray': ImageIcon,
}

function pickIcon(iconName?: string | null): Icon {
  return (iconName && DEPARTMENT_ICONS[iconName]) || SparkleIcon
}

type Department = NonNullable<NonNullable<CoverageRule['service']>['department']>
type ResolvedRule = CoverageRule & {
  service: NonNullable<CoverageRule['service']> & { department: Department }
}

type Props = {
  providers: InsuranceDoc[]
}

type StepState = {
  step: 1 | 2 | 3 | 4
  provider: InsuranceDoc | null
  department: Department | null
  rule: ResolvedRule | null
  direction: 1 | -1
}

export function InsuranceCalculator({ providers }: Props) {
  const t = useTranslations('insurance')
  const locale = useLocale() as Locale
  const isRtl = locale === 'ar'

  const [state, setState] = useState<StepState>({
    step: 1,
    provider: null,
    department: null,
    rule: null,
    direction: 1,
  })

  const canNext = useMemo(() => {
    if (state.step === 1) return !!state.provider
    if (state.step === 2) return !!state.department
    if (state.step === 3) return !!state.rule
    return false
  }, [state])

  const goNext = () => {
    if (!canNext) return
    setState((s) => ({ ...s, step: Math.min(4, s.step + 1) as 1 | 2 | 3 | 4, direction: 1 }))
  }

  const goBack = () => {
    setState((s) => ({ ...s, step: Math.max(1, s.step - 1) as 1 | 2 | 3 | 4, direction: -1 }))
  }

  const reset = () => {
    setState({ step: 1, provider: null, department: null, rule: null, direction: -1 })
  }

  const physical = (dir: 1 | -1) => (isRtl ? -dir : dir)

  const stepVariants: Variants = {
    enter: (dir: 1 | -1) => ({ x: physical(dir) * 40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: 1 | -1) => ({ x: physical(dir) * -40, opacity: 0 }),
  }

  if (providers.length === 0) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-line bg-white p-8 text-center shadow-soft">
        <p className="text-sm leading-relaxed text-muted-foreground">{t('empty')}</p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* Progress bar */}
      <div className="flex flex-col gap-3 print:hidden">
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span className="uppercase tracking-wider text-teal-deep">
            {t('stepLabel', { current: state.step, total: TOTAL_STEPS })}
          </span>
          <span>
            {state.step === 1 && t('steps.provider')}
            {state.step === 2 && t('steps.category')}
            {state.step === 3 && t('steps.service')}
            {state.step === 4 && t('steps.result')}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {[1, 2, 3, 4].map((n) => (
            <span
              key={n}
              className={cn(
                'h-1.5 rounded-full transition-colors',
                n <= state.step ? 'bg-gold' : 'bg-line',
              )}
            />
          ))}
        </div>
      </div>

      {/* Step body */}
      <div className="relative mt-8 min-h-[26rem] overflow-hidden">
        <AnimatePresence mode="wait" custom={state.direction} initial={false}>
          <motion.div
            key={state.step}
            custom={state.direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.32, ease: [0.65, 0, 0.35, 1] }}
          >
            {state.step === 1 && (
              <Step1Provider
                providers={providers}
                selected={state.provider}
                onPick={(p) =>
                  setState((s) => ({
                    ...s,
                    provider: p,
                    department: s.provider?._id === p._id ? s.department : null,
                    rule: s.provider?._id === p._id ? s.rule : null,
                  }))
                }
              />
            )}
            {state.step === 2 && state.provider && (
              <Step2Department
                provider={state.provider}
                selected={state.department}
                onPick={(d) =>
                  setState((s) => ({
                    ...s,
                    department: d,
                    rule: s.department?._id === d._id ? s.rule : null,
                  }))
                }
              />
            )}
            {state.step === 3 && state.provider && state.department && (
              <Step3Service
                provider={state.provider}
                department={state.department}
                selected={state.rule}
                onPick={(r) => setState((s) => ({ ...s, rule: r }))}
              />
            )}
            {state.step === 4 && state.provider && state.department && state.rule && (
              <Step4Result
                provider={state.provider}
                department={state.department}
                rule={state.rule}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer controls */}
      <div className="mt-8 flex items-center justify-between gap-3 print:hidden">
        {state.step > 1 ? (
          <button
            type="button"
            onClick={goBack}
            className="inline-flex h-11 items-center gap-1.5 rounded-lg border border-line bg-white px-4 text-sm font-medium text-teal-deep hover:border-teal-deep/40"
          >
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            {t('back')}
          </button>
        ) : (
          <span aria-hidden="true" />
        )}

        {state.step < 4 ? (
          <Button
            onClick={goNext}
            disabled={!canNext}
            size="lg"
            className="h-11 rounded-lg bg-teal-deep px-5 text-cream-light hover:bg-teal disabled:opacity-40"
          >
            {t('next')}
            <ChevronRight className="ms-1.5 h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          </Button>
        ) : (
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-11 items-center gap-1.5 rounded-lg border border-line bg-white px-4 text-sm font-medium text-teal-deep hover:border-teal-deep/40"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {t('startOver')}
          </button>
        )}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- Logo tile */
function ProviderLogo({
  provider,
  size = 64,
}: {
  provider: InsuranceDoc
  size?: number
}) {
  const logoUrl = provider.logo
    ? urlForImage(provider.logo)?.width(size * 2).height(size * 2).url() ?? null
    : null
  const color = provider.brandColor || DEFAULT_BRAND_COLOR
  const label = provider.shortLabel || provider.name?.en?.slice(0, 4).toUpperCase() || '—'
  const altName = provider.name?.en || provider.name?.ar || label

  if (logoUrl) {
    return (
      <span
        className="relative grid place-items-center overflow-hidden rounded-xl bg-white shadow-soft ring-1 ring-line"
        style={{ width: size, height: size }}
      >
        <Image
          src={logoUrl}
          alt={altName}
          width={size}
          height={size}
          className="h-full w-full object-contain p-1.5"
        />
      </span>
    )
  }

  return (
    <span
      className="grid place-items-center rounded-xl font-bold text-white shadow-soft"
      style={{
        background: color,
        width: size,
        height: size,
        fontSize: size <= 48 ? '0.75rem' : '0.95rem',
      }}
      aria-label={altName}
    >
      {label}
    </span>
  )
}

/* ---------------------------------------------------------------- Step 1 */
function Step1Provider({
  providers,
  selected,
  onPick,
}: {
  providers: InsuranceDoc[]
  selected: InsuranceDoc | null
  onPick: (p: InsuranceDoc) => void
}) {
  const t = useTranslations('insurance')
  const locale = useLocale() as Locale

  return (
    <div>
      <h2 className="text-center font-semibold text-teal-deep text-[clamp(1.4rem,2.6vw,1.8rem)]">
        {t('steps.provider')}
      </h2>
      <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {providers.map((p) => {
          const isSelected = selected?._id === p._id
          const displayName = p.name?.[locale] || p.name?.en || p.name?.ar || ''
          return (
            <button
              key={p._id}
              type="button"
              onClick={() => onPick(p)}
              aria-pressed={isSelected}
              className={cn(
                'group relative flex flex-col items-center gap-3 rounded-2xl border bg-white p-4 text-center transition-all',
                isSelected
                  ? 'border-gold shadow-medium ring-2 ring-gold/40'
                  : 'border-line hover:-translate-y-0.5 hover:border-teal-deep/30 hover:shadow-soft',
              )}
            >
              <ProviderLogo provider={p} size={64} />
              <span className="text-sm font-semibold leading-tight text-teal-deep">
                {displayName}
              </span>
              {isSelected && (
                <span
                  className="absolute top-2 grid h-6 w-6 place-items-center rounded-full bg-gold text-teal-deep"
                  style={{ insetInlineEnd: '0.5rem' }}
                >
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- Step 2 */
function uniqueDepartments(provider: InsuranceDoc): Department[] {
  const map = new Map<string, Department>()
  for (const rule of provider.coverageRules ?? []) {
    const dept = rule?.service?.department
    if (dept && !map.has(dept._id)) map.set(dept._id, dept)
  }
  return Array.from(map.values()).sort(
    (a, b) => (a.displayOrder ?? 100) - (b.displayOrder ?? 100),
  )
}

function Step2Department({
  provider,
  selected,
  onPick,
}: {
  provider: InsuranceDoc
  selected: Department | null
  onPick: (d: Department) => void
}) {
  const t = useTranslations('insurance')
  const locale = useLocale() as Locale

  const departments = useMemo(() => uniqueDepartments(provider), [provider])

  if (departments.length === 0) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-line bg-white p-8 text-center">
        <p className="text-sm leading-relaxed text-muted-foreground">{t('noDepartments')}</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-center font-semibold text-teal-deep text-[clamp(1.4rem,2.6vw,1.8rem)]">
        {t('steps.category')}
      </h2>
      <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {departments.map((d) => {
          const isSelected = selected?._id === d._id
          const label = d.name?.[locale] || d.name?.en || d.name?.ar || ''
          return (
            <button
              key={d._id}
              type="button"
              onClick={() => onPick(d)}
              aria-pressed={isSelected}
              className={cn(
                'group flex flex-col items-center gap-3 rounded-2xl border bg-white p-5 text-center transition-all',
                isSelected
                  ? 'border-gold shadow-medium ring-2 ring-gold/40'
                  : 'border-line hover:-translate-y-0.5 hover:border-teal-deep/30 hover:shadow-soft',
              )}
            >
              <span
                className={cn(
                  'grid h-14 w-14 place-items-center rounded-xl transition-colors',
                  isSelected ? 'bg-gold/15 ring-1 ring-gold/30' : 'bg-cream ring-1 ring-line',
                )}
              >
                {createElement(pickIcon(d.iconName), {
                  size: 28,
                  weight: 'duotone',
                  className: cn(
                    'transition-colors',
                    isSelected ? 'text-gold' : 'text-teal-deep',
                  ),
                })}
              </span>
              <span className="text-sm font-semibold text-teal-deep">{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- Step 3 */
function rulesForDepartment(provider: InsuranceDoc, departmentId: string): ResolvedRule[] {
  const result: ResolvedRule[] = []
  for (const rule of provider.coverageRules ?? []) {
    const service = rule?.service
    const department = service?.department
    if (service && department && department._id === departmentId) {
      result.push({
        ...rule,
        service: { ...service, department },
      })
    }
  }
  return result.sort((a, b) => {
    const aOrder = a.service.order ?? 100
    const bOrder = b.service.order ?? 100
    if (aOrder !== bOrder) return aOrder - bOrder
    return (a.service.name?.en || '').localeCompare(b.service.name?.en || '')
  })
}

function Step3Service({
  provider,
  department,
  selected,
  onPick,
}: {
  provider: InsuranceDoc
  department: Department
  selected: ResolvedRule | null
  onPick: (r: ResolvedRule) => void
}) {
  const t = useTranslations('insurance')
  const locale = useLocale() as Locale
  const rules = useMemo(
    () => rulesForDepartment(provider, department._id),
    [provider, department._id],
  )
  const deptLabel = department.name?.[locale] || department.name?.en || department.name?.ar || ''

  return (
    <div>
      <div className="flex items-center justify-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-cream ring-1 ring-line">
          {createElement(pickIcon(department.iconName), {
            size: 22,
            weight: 'duotone',
            className: 'text-teal-deep',
          })}
        </span>
        <h2 className="text-center font-semibold text-teal-deep text-[clamp(1.3rem,2.4vw,1.7rem)]">
          {t('steps.service')} — {deptLabel}
        </h2>
      </div>

      <div className="mx-auto mt-6 max-w-xl">
        <ul className="space-y-2">
          {rules.map((r) => {
            const isSelected = selected?.service._id === r.service._id
            const serviceName =
              r.service.name?.[locale] || r.service.name?.en || r.service.name?.ar || ''
            return (
              <li key={r._key || r.service._id}>
                <button
                  type="button"
                  onClick={() => onPick(r)}
                  aria-pressed={isSelected}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 text-start transition-all',
                    isSelected
                      ? 'border-gold ring-2 ring-gold/40'
                      : 'border-line hover:border-teal-deep/30',
                  )}
                >
                  <span className="text-sm font-medium text-teal-deep">{serviceName}</span>
                  {isSelected && <Check className="h-4 w-4 text-gold" aria-hidden="true" />}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------- Step 4 */
function Step4Result({
  provider,
  department,
  rule,
}: {
  provider: InsuranceDoc
  department: Department
  rule: ResolvedRule
}) {
  const t = useTranslations('insurance')
  const locale = useLocale() as Locale

  const providerName = provider.name?.[locale] || provider.name?.en || provider.name?.ar || ''
  const deptName = department.name?.[locale] || department.name?.en || department.name?.ar || ''
  const serviceName =
    rule.service.name?.[locale] || rule.service.name?.en || rule.service.name?.ar || ''

  const coverage = rule.percentage
  const coverageText = `${coverage}%`
  const ruleNote = rule.notes?.[locale] || null
  const providerNote = provider.coverageNote?.[locale] || null

  const note = t('whatsappTemplate', {
    provider: providerName,
    service: serviceName,
    category: deptName,
    coverage,
  })
  const whatsappHref = getWhatsAppUrl({
    type: 'inquiry',
    locale,
    department: { name: deptName },
    service: { name: serviceName },
    notes: note,
  })

  const onPrint = () => {
    if (typeof window !== 'undefined') window.print()
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div
        className="relative overflow-hidden rounded-3xl border border-line bg-white p-8 shadow-medium print:border-none print:shadow-none"
        id="insurance-result-card"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 print:hidden"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 100% 0%, rgba(201,169,97,0.10) 0%, transparent 60%)',
          }}
        />

        <div className="relative">
          <div className="flex items-center justify-center gap-3">
            <ProviderLogo provider={provider} size={48} />
            <div className="flex flex-col leading-tight">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {t('result.providerLabel')}
              </span>
              <span className="text-sm font-semibold text-teal-deep">{providerName}</span>
            </div>
          </div>

          {/* Big coverage */}
          <div className="mt-8 grid place-items-center text-center">
            <span className="text-xs uppercase tracking-[0.18em] text-gold">
              {t('result.coverageLabel')}
            </span>
            <span
              className="mt-2 bg-clip-text font-bold leading-none text-transparent"
              style={{
                fontSize: 'clamp(4rem, 12vw, 7rem)',
                backgroundImage:
                  'linear-gradient(180deg, var(--color-teal-deep) 0%, var(--color-teal) 60%, var(--color-teal-light) 100%)',
                WebkitBackgroundClip: 'text',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {coverageText}
            </span>
            {coverage === 0 && (
              <p className="mt-3 max-w-md text-sm text-muted-foreground">
                {t('result.notCovered')}
              </p>
            )}
            {rule.requiresApproval && (
              <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold text-teal-deep">
                {t('result.requiresApproval')}
              </p>
            )}
          </div>

          {/* Meta */}
          <dl className="mt-8 grid gap-3 rounded-2xl bg-cream/60 p-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                {t('result.categoryLabel')}
              </dt>
              <dd className="mt-1 text-sm font-semibold text-teal-deep">{deptName}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                {t('result.serviceLabel')}
              </dt>
              <dd className="mt-1 text-sm font-semibold text-teal-deep">{serviceName}</dd>
            </div>
          </dl>

          {(ruleNote || providerNote) && (
            <p className="mt-5 rounded-xl bg-cream/40 px-4 py-3 text-xs leading-relaxed text-teal-deep">
              {ruleNote || providerNote}
            </p>
          )}

          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
            {t('result.disclaimer')}
          </p>

          {/* CTAs */}
          <div className="mt-6 flex flex-wrap items-center gap-3 print:hidden">
            <Button
              render={<a href={whatsappHref} target="_blank" rel="noopener noreferrer" />}
              nativeButton={false}
              size="lg"
              className="h-12 flex-1 rounded-lg bg-teal-deep text-cream-light shadow-medium hover:bg-teal"
            >
              <WhatsappLogoIcon size={20} weight="fill" className="me-2" />
              {t('result.cta')}
            </Button>
            <button
              type="button"
              onClick={onPrint}
              className="inline-flex h-12 items-center gap-2 rounded-lg border border-line bg-white px-4 text-sm font-medium text-teal-deep hover:border-teal-deep/40"
            >
              <Printer className="h-4 w-4" aria-hidden="true" />
              {t('result.print')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
