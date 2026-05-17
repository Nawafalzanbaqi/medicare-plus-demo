import { revalidateTag } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * On-demand revalidation for Sanity content. Configure a webhook in
 * sanity.io/manage that POSTs to /api/revalidate whenever a document is
 * created, updated, or deleted. Each cached query in src/sanity/lib/queries.ts
 * carries a tag (e.g. 'department', 'siteSettings', 'homePage'); we
 * invalidate the matching tag based on the document's `_type`.
 *
 * Headers expected:
 *   - `x-sanity-signature`  shared secret stored in `SANITY_WEBHOOK_SECRET`
 *
 * Body shape (Sanity webhook payload):
 *   { _type: string, slug?: { current?: string } }
 */

type Payload = {
  _type?: string
  slug?: { current?: string } | { ar?: { current?: string }; en?: { current?: string } }
}

const TYPE_TO_TAG: Record<string, string[]> = {
  siteSettings: ['siteSettings'],
  topBar: ['topBar'],
  trustBar: ['trustBar'],
  footer: ['footer'],
  homePage: ['homePage'],
  department: ['department'],
  doctor: ['doctor'],
  service: ['department'],
  article: ['article'],
  testimonial: ['testimonial'],
  offer: ['offer'],
  insurance: ['insurance'],
}

export async function POST(request: NextRequest) {
  const expected = process.env.SANITY_WEBHOOK_SECRET
  if (expected) {
    const provided =
      request.headers.get('x-sanity-signature') ||
      request.headers.get('x-webhook-secret')
    if (provided !== expected) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }
  }

  let payload: Payload
  try {
    payload = (await request.json()) as Payload
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const type = payload._type
  if (!type) {
    return NextResponse.json({ ok: false, error: 'Missing _type' }, { status: 400 })
  }

  const tags = TYPE_TO_TAG[type] ?? []
  if (tags.length === 0) {
    return NextResponse.json({ ok: true, revalidated: [], note: 'unknown type' })
  }

  // Next 16's revalidateTag takes a second arg ('CacheLifeConfig' or profile name).
  // `{ expire: 0 }` invalidates the tag immediately for all consumers.
  const PURGE = { expire: 0 } as const

  for (const tag of tags) {
    revalidateTag(tag, PURGE)
  }

  // For per-document tags (e.g. a specific department slug), invalidate too.
  const slugVal =
    typeof (payload.slug as { current?: string } | undefined)?.current === 'string'
      ? (payload.slug as { current?: string }).current
      : undefined
  if (type === 'department' && slugVal) {
    revalidateTag(`department:${slugVal}`, PURGE)
  }
  if (type === 'article' && slugVal) {
    revalidateTag(`article:${slugVal}`, PURGE)
  }

  return NextResponse.json({ ok: true, revalidated: tags, type })
}
