'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Search, X } from 'lucide-react'
import { WhatsappLogoIcon } from '@phosphor-icons/react/dist/ssr'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { AnimatedNumber } from '@/components/shared/AnimatedNumber'
import { SafeImage } from '@/components/shared/SafeImage'
import { FilterDropdown } from './FilterDropdown'
import {
  ALL_DEPARTMENTS,
  type DepartmentSlug,
  type Doctor,
  type DoctorGender,
  type DoctorLanguage,
  type DoctorNationality,
} from '@/lib/data'
import { getWhatsAppUrl } from '@/lib/whatsapp'

const LANGUAGES: DoctorLanguage[] = ['ar', 'en', 'fr', 'ur']
const NATIONALITIES: DoctorNationality[] = ['sa', 'eg', 'jo', 'sd', 'in', 'pk']
const NATIONALITY_FLAG: Record<DoctorNationality, string> = {
  sa: '🇸🇦',
  eg: '🇪🇬',
  jo: '🇯🇴',
  sd: '🇸🇩',
  in: '🇮🇳',
  pk: '🇵🇰',
}
const LANGUAGE_CODE_UPPER: Record<DoctorLanguage, string> = {
  ar: 'AR',
  en: 'EN',
  fr: 'FR',
  ur: 'UR',
}
const FEATURED: DepartmentSlug[] = ['cosmetic', 'surgery', 'audiology']

type Filters = {
  departments: DepartmentSlug[]
  gender: DoctorGender | 'all'
  languages: DoctorLanguage[]
  nationalities: DoctorNationality[]
  search: string
}

const EMPTY_FILTERS: Filters = {
  departments: [],
  gender: 'all',
  languages: [],
  nationalities: [],
  search: '',
}

function parseFilters(params: URLSearchParams, validSlugs: Set<string>): Filters {
  const csv = (key: string) =>
    (params.get(key) ?? '').split(',').filter(Boolean)

  return {
    departments: csv('dept').filter((d): d is DepartmentSlug => validSlugs.has(d)),
    gender:
      params.get('gender') === 'male' || params.get('gender') === 'female'
        ? (params.get('gender') as DoctorGender)
        : 'all',
    languages: csv('lang').filter((l): l is DoctorLanguage =>
      (LANGUAGES as string[]).includes(l),
    ),
    nationalities: csv('nat').filter((n): n is DoctorNationality =>
      (NATIONALITIES as string[]).includes(n),
    ),
    search: params.get('q') ?? '',
  }
}

function serialiseFilters(f: Filters): string {
  const params = new URLSearchParams()
  if (f.departments.length) params.set('dept', f.departments.join(','))
  if (f.gender !== 'all') params.set('gender', f.gender)
  if (f.languages.length) params.set('lang', f.languages.join(','))
  if (f.nationalities.length) params.set('nat', f.nationalities.join(','))
  if (f.search.trim()) params.set('q', f.search.trim())
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

type Props = {
  doctors: Doctor[]
}

export function DoctorsDirectory({ doctors }: Props) {
  const t = useTranslations('doctors')
  const tDeptAll = useTranslations('allDepartments')
  const tDeptFeatured = useTranslations('featuredDepartments')
  const locale = useLocale() as 'ar' | 'en'
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const validSlugs = useMemo(
    () => new Set(ALL_DEPARTMENTS.map((d) => d.slug)),
    [],
  )

  const [filters, setFilters] = useState<Filters>(() =>
    parseFilters(
      new URLSearchParams(searchParams?.toString() ?? ''),
      validSlugs,
    ),
  )

  // Sync filters → URL
  useEffect(() => {
    if (!pathname) return
    const qs = serialiseFilters(filters)
    router.replace(`${pathname}${qs}`, { scroll: false })
  }, [filters, pathname, router])

  const deptLabel = useCallback(
    (slug: DepartmentSlug) => {
      if ((FEATURED as string[]).includes(slug))
        return tDeptFeatured(`${slug}.name`)
      // Unknown slugs (e.g. CMS data that introduces new departments before the
      // translation file catches up) fall back to a humanised version of the
      // slug instead of throwing MISSING_MESSAGE.
      if (!validSlugs.has(slug))
        return slug.charAt(0).toUpperCase() + slug.slice(1)
      return tDeptAll(`${slug}.name`)
    },
    [tDeptAll, tDeptFeatured, validSlugs],
  )

  // Filtering
  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase()
    return doctors.filter((d) => {
      if (filters.departments.length && !filters.departments.includes(d.department))
        return false
      if (filters.gender !== 'all' && d.gender !== filters.gender) return false
      if (
        filters.languages.length &&
        !d.languages.some((l) => filters.languages.includes(l))
      )
        return false
      if (
        filters.nationalities.length &&
        !filters.nationalities.includes(d.nationality)
      )
        return false
      if (q) {
        const haystack = `${d.name.ar} ${d.name.en} ${d.specialty.ar} ${d.specialty.en}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [doctors, filters])

  const reset = () => setFilters(EMPTY_FILTERS)

  const activeCount =
    filters.departments.length +
    (filters.gender === 'all' ? 0 : 1) +
    filters.languages.length +
    filters.nationalities.length +
    (filters.search.trim() ? 1 : 0)

  return (
    <>
      {/* Sticky filter bar */}
      <div className="sticky top-16 z-20 border-b border-line bg-cream-light/95 backdrop-blur supports-[backdrop-filter]:bg-cream-light/80 md:top-20">
        <div className="container mx-auto flex flex-wrap items-center gap-3 px-4 py-4">
          {/* Search */}
          <label className="relative flex h-10 min-w-0 flex-1 items-center rounded-lg border border-line bg-white px-3 focus-within:border-teal-deep">
            <Search className="me-2 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <input
              type="search"
              value={filters.search}
              onChange={(e) =>
                setFilters((f) => ({ ...f, search: e.target.value }))
              }
              placeholder={t('searchPlaceholder')}
              className="h-full w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </label>

          {/* Department (multi) */}
          <FilterChip
            label={t('filters.department')}
            kind="multi"
            options={ALL_DEPARTMENTS.map((d) => ({
              value: d.slug,
              label: deptLabel(d.slug),
            }))}
            selected={filters.departments}
            onChange={(v) =>
              setFilters((f) => ({ ...f, departments: v as DepartmentSlug[] }))
            }
            countTpl={(n) => t('filters.selectedCount', { count: n })}
          />

          {/* Gender (single radio: male / female / all) */}
          <FilterChip
            label={t('filters.gender')}
            kind="single"
            options={[
              { value: 'all', label: t('filters.all') },
              { value: 'male', label: t('filters.male') },
              { value: 'female', label: t('filters.female') },
            ]}
            selected={filters.gender === 'all' ? [] : [filters.gender]}
            onChange={(v) =>
              setFilters((f) => ({
                ...f,
                gender:
                  v[0] === 'male' || v[0] === 'female'
                    ? (v[0] as DoctorGender)
                    : 'all',
              }))
            }
            countTpl={(n) => t('filters.selectedCount', { count: n })}
          />

          {/* Language (multi) */}
          <FilterChip
            label={t('filters.language')}
            kind="multi"
            options={LANGUAGES.map((l) => ({
              value: l,
              label: t(`filters.languages.${l}`),
            }))}
            selected={filters.languages}
            onChange={(v) =>
              setFilters((f) => ({ ...f, languages: v as DoctorLanguage[] }))
            }
            countTpl={(n) => t('filters.selectedCount', { count: n })}
          />

          {/* Nationality (multi) */}
          <FilterChip
            label={t('filters.nationality')}
            kind="multi"
            options={NATIONALITIES.map((n) => ({
              value: n,
              label: t(`filters.nationalities.${n}`),
            }))}
            selected={filters.nationalities}
            onChange={(v) =>
              setFilters((f) => ({
                ...f,
                nationalities: v as DoctorNationality[],
              }))
            }
            countTpl={(n) => t('filters.selectedCount', { count: n })}
          />

          {activeCount > 0 && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-teal-deep/80 hover:text-teal-deep"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              {t('filters.reset')}
            </button>
          )}
        </div>
      </div>

      {/* Result count */}
      <div className="container mx-auto px-4 pt-8">
        <p className="text-sm text-muted-foreground">
          {t('showing', { count: filtered.length, total: doctors.length })}
        </p>
      </div>

      {/* Grid / empty state */}
      <div className="container mx-auto px-4 pb-20 pt-6 sm:pb-24">
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="mx-auto max-w-md rounded-2xl border border-line bg-white p-10 text-center shadow-soft"
            >
              <h2 className="text-lg font-semibold text-teal-deep">
                {t('empty.title')}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t('empty.description')}
              </p>
              <Button
                onClick={reset}
                className="mt-5 rounded-lg bg-teal-deep text-cream-light hover:bg-teal"
              >
                {t('filters.reset')}
              </Button>
            </motion.div>
          ) : (
            <motion.ul
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((doctor) => (
                  <motion.li
                    key={doctor.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.25, ease: [0.65, 0, 0.35, 1] }}
                  >
                    <DoctorDirectoryCard
                      doctor={doctor}
                      locale={locale}
                      departmentLabel={deptLabel(doctor.department)}
                      genderLabel={t(`filters.${doctor.gender}`)}
                      nationalityLabel={t(
                        `filters.nationalities.${doctor.nationality}`,
                      )}
                      yearsLabel={t('card.yearsExperience')}
                      bookLabel={t('card.book')}
                    />
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

type ChipProps = {
  label: string
  options: { value: string; label: string }[]
  selected: string[]
  onChange: (v: string[]) => void
  kind: 'multi' | 'single'
  countTpl: (n: number) => string
}

function FilterChip({ label, options, selected, onChange, kind, countTpl }: ChipProps) {
  return (
    <FilterDropdown
      label={label}
      options={options}
      selected={selected}
      onChange={onChange}
      single={kind === 'single'}
      selectedCountTemplate={countTpl}
    />
  )
}

type CardProps = {
  doctor: Doctor
  locale: 'ar' | 'en'
  departmentLabel: string
  genderLabel: string
  nationalityLabel: string
  yearsLabel: string
  bookLabel: string
}

function DoctorDirectoryCard({
  doctor,
  locale,
  departmentLabel,
  genderLabel,
  nationalityLabel,
  yearsLabel,
  bookLabel,
}: CardProps) {
  const fullName = `${doctor.title[locale]} ${doctor.name[locale]}`
  const href = getWhatsAppUrl({
    type: 'doctor-inquiry',
    locale,
    doctor: { name: fullName, specialty: doctor.specialty[locale] },
  })

  return (
    <article className="group flex h-full flex-col gap-4 rounded-2xl border border-line bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:shadow-medium sm:p-6">
      <div className="flex items-center gap-4">
        <SafeImage
          src={doctor.photo}
          alt={`${doctor.title[locale]} ${doctor.name[locale]}`}
          sizes="80px"
          aspect="square"
          wrapperClassName="h-20 w-20 shrink-0 rounded-full ring-2 ring-gold/30 ring-offset-2 ring-offset-white"
          rounded={false}
          locale={locale}
        />
        <div className="min-w-0">
          {doctor.slug ? (
            <Link
              href={`/doctors/${doctor.slug}`}
              className="block truncate text-base font-semibold text-teal-deep hover:text-gold sm:text-lg"
            >
              {doctor.title[locale]} {doctor.name[locale]}
            </Link>
          ) : (
            <h3 className="truncate text-base font-semibold text-teal-deep sm:text-lg">
              {doctor.title[locale]} {doctor.name[locale]}
            </h3>
          )}
          <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted-foreground sm:text-sm">
            {doctor.specialty[locale]}
          </p>
          <span className="mt-2 inline-flex items-center rounded-full bg-cream px-2.5 py-0.5 text-[11px] font-medium text-teal-deep">
            {departmentLabel}
          </span>
        </div>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <AnimatedNumber
            value={doctor.yearsExperience}
            className="text-sm font-semibold text-teal-deep"
          />
          <span className="uppercase tracking-wider">{yearsLabel}</span>
        </span>
        <span aria-label={genderLabel} title={genderLabel} className="inline-flex items-center gap-1">
          <span aria-hidden="true">{doctor.gender === 'female' ? '♀' : '♂'}</span>
          <span className="sr-only">{genderLabel}</span>
        </span>
        <span
          aria-label={nationalityLabel}
          title={nationalityLabel}
          className="inline-flex items-center gap-1 leading-none"
        >
          <span aria-hidden="true" className="text-base leading-none">
            {NATIONALITY_FLAG[doctor.nationality]}
          </span>
        </span>
        <span className="inline-flex items-center gap-1">
          {doctor.languages.map((l) => (
            <span
              key={l}
              className="rounded bg-cream px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-teal-deep/80"
              dir="ltr"
            >
              {LANGUAGE_CODE_UPPER[l]}
            </span>
          ))}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          render={<a href={href} target="_blank" rel="noopener noreferrer" />}
          nativeButton={false}
          size="sm"
          className="flex-1 rounded-lg bg-teal-deep text-cream-light hover:bg-teal"
        >
          <WhatsappLogoIcon size={16} weight="fill" className="me-2" />
          {bookLabel}
        </Button>
        {doctor.slug && (
          <Link
            href={`/doctors/${doctor.slug}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-teal-deep transition-colors hover:border-gold/50 hover:text-gold"
          >
            <span>{locale === 'ar' ? 'الملف' : 'Profile'}</span>
            <ArrowRight
              className="h-3.5 w-3.5 rtl:rotate-180"
              aria-hidden="true"
            />
          </Link>
        )}
      </div>
    </article>
  )
}
