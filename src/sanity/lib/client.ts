import 'server-only'

import { createClient, type SanityClient } from 'next-sanity'
import { apiVersion, dataset, isSanityConfigured, projectId, token } from '../env'

let _client: SanityClient | null = null

export function getSanityClient(): SanityClient | null {
  if (!isSanityConfigured) return null
  if (_client) return _client
  _client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: true,
    perspective: 'published',
    token: token || undefined,
  })
  return _client
}

/**
 * Run a GROQ query, returning null when Sanity isn't configured yet so the
 * site keeps working in pre-CMS mode (translations + lib/data.ts).
 */
export async function sanityFetch<T = unknown>(
  query: string,
  params: Record<string, unknown> = {},
  options: { revalidate?: number | false; tags?: string[] } = {},
): Promise<T | null> {
  const client = getSanityClient()
  if (!client) return null

  const { revalidate = 60, tags } = options
  try {
    return await client.fetch<T>(query, params, {
      next: { revalidate, tags },
    })
  } catch (error) {
    // Studio not yet seeded, network error, etc.
    console.warn('[sanity] fetch failed:', (error as Error).message)
    return null
  }
}
