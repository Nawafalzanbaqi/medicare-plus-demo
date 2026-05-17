import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'

/**
 * Turn Next.js draft mode on. Called by the Presentation Tool when
 * a Studio user clicks "Preview". The optional `?slug=` query parameter
 * specifies which page to land on after the cookie is set.
 *
 * In production you should also validate a shared secret against
 * `process.env.SANITY_DRAFT_SECRET` before flipping draft mode on.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const slug = url.searchParams.get('slug') || '/'

  // Basic shared-secret validation (only enforced when the env var is set).
  const secret = url.searchParams.get('secret')
  const expected = process.env.SANITY_DRAFT_SECRET
  if (expected && secret !== expected) {
    return new Response('Invalid secret', { status: 401 })
  }

  ;(await draftMode()).enable()
  redirect(slug)
}
