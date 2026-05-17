import { routing } from '@/i18n/routing'

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://medicare-plus-demo.vercel.app'

export function languageAlternates(path: string) {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return Object.fromEntries(
    routing.locales.map((l) => [l, `${SITE_URL}/${l}${normalized === '/' ? '' : normalized}`]),
  )
}

export function canonicalUrl(locale: string, path: string) {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}/${locale}${normalized === '/' ? '' : normalized}`
}
