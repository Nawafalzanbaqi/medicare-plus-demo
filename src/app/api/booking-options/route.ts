import { NextResponse } from 'next/server'
import { getSanityClient } from '@/sanity/lib/client'

/**
 * Public endpoint feeding the QuickBookingBar + /book booking flow with
 * the list of active departments and their services. Locale-agnostic —
 * returns both AR + EN labels so each client picks the right one.
 *
 * Two parallel views are returned:
 * - `departments[i].services` — the inline services array (each service's
 *   `department._ref` matches this dept).
 * - `servicesByDepartmentSlug` — fallback lookup keyed by the department
 *   slug. Used as a safety net by the QuickBookingBar in case the inline
 *   array is empty due to inconsistent data — we re-resolve services
 *   via `department->slug.current == <slug>` which catches a different
 *   class of authoring mistakes.
 *
 * ISR-cached (60 s) and tagged `department` + `service` so a single
 * Sanity webhook purges both lookups at once.
 */

export const revalidate = 60

type LocalizedString = { ar: string; en: string }

type ServiceOut = {
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

type DepartmentOut = {
  _id: string
  slug: string
  name: LocalizedString
  shortDescription?: LocalizedString | null
  icon?: string | null
  accentColor?: string | null
  isFeatured?: boolean | null
  services: ServiceOut[]
}

export type BookingOptionsResponse = {
  departments: DepartmentOut[]
  /** Fallback lookup: services grouped by department slug. */
  servicesByDepartmentSlug: Record<string, ServiceOut[]>
}

const QUERY = /* groq */ `
  {
    "departments": *[_type == "department" && (isActive != false)]
      | order(coalesce(displayOrder, 100) asc) {
        _id,
        "slug": slug.current,
        name,
        shortDescription,
        "icon": icon,
        accentColor,
        isFeatured,
        "services": *[_type == "service" && department._ref == ^._id && defined(slug.current)]
          | order(coalesce(order, 100) asc) {
            _id,
            "slug": slug.current,
            name,
            description,
            icon,
            price,
            showPrice,
            duration,
            isPopular
          }
      },
    "servicesBySlug": *[_type == "service" && defined(slug.current) && defined(department->slug.current)] {
      _id,
      "slug": slug.current,
      name,
      description,
      icon,
      price,
      showPrice,
      duration,
      isPopular,
      "departmentSlug": department->slug.current
    } | order(coalesce(order, 100) asc)
  }
`

type SanityResult = {
  departments: DepartmentOut[] | null
  servicesBySlug: (ServiceOut & { departmentSlug: string })[] | null
}

function groupBySlug(
  rows: SanityResult['servicesBySlug'],
): Record<string, ServiceOut[]> {
  const out: Record<string, ServiceOut[]> = {}
  for (const row of rows ?? []) {
    const { departmentSlug, ...service } = row
    if (!departmentSlug) continue
    if (!out[departmentSlug]) out[departmentSlug] = []
    out[departmentSlug].push(service)
  }
  return out
}

export async function GET() {
  const client = getSanityClient()
  const empty: BookingOptionsResponse = {
    departments: [],
    servicesByDepartmentSlug: {},
  }

  if (!client) {
    return NextResponse.json(empty)
  }

  try {
    const result = await client.fetch<SanityResult>(
      QUERY,
      {},
      { next: { revalidate: 60, tags: ['department', 'service'] } },
    )

    const fallback = groupBySlug(result?.servicesBySlug ?? [])

    // Merge the fallback view into the inline view so the QuickBookingBar
    // still sees services even when a department's `services[]` field is
    // empty but the service's `department->` reference is set.
    const departments = (result?.departments ?? []).map((d) => {
      const inline = d.services ?? []
      if (inline.length > 0) return { ...d, services: inline }
      const fromSlug = fallback[d.slug] ?? []
      return { ...d, services: fromSlug }
    })

    return NextResponse.json({
      departments,
      servicesByDepartmentSlug: fallback,
    } satisfies BookingOptionsResponse)
  } catch {
    return NextResponse.json(empty)
  }
}
