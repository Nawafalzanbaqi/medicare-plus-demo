/**
 * Sanity environment values. All vars are optional at build time so the
 * project compiles before the user runs `npx sanity init`. At runtime, the
 * Sanity client falls back to a no-op when `projectId` is empty.
 */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? ''
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2024-12-01'
export const studioBasePath = '/studio'

/** Read-only token for server-side draft preview. Optional. */
export const token = process.env.SANITY_API_READ_TOKEN ?? ''

/** True when there is enough config to actually talk to Sanity. */
export const isSanityConfigured = projectId.length > 0
