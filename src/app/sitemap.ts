import type { MetadataRoute } from 'next'
import { routing } from '@/i18n/routing'
import { ALL_DEPARTMENTS } from '@/lib/data'
import { listAllSlugs } from '@/lib/blog'
import { SITE_URL } from '@/lib/seo'

const STATIC_PATHS = [
  '',
  '/departments',
  '/doctors',
  '/insurance',
  '/blog',
  '/about',
  '/offers',
  '/contact',
] as const

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const departmentPaths = ALL_DEPARTMENTS.map((d) => `/departments/${d.slug}`)
  const blogSlugs = await listAllSlugs()
  // Dedupe blog slugs (same slug across locales is one path per locale)
  const uniqueBlogSlugs = Array.from(new Set(blogSlugs.map((b) => b.slug)))
  const blogPaths = uniqueBlogSlugs.map((slug) => `/blog/${slug}`)

  const allPaths = [...STATIC_PATHS, ...departmentPaths, ...blogPaths]
  const now = new Date()

  return routing.locales.flatMap((locale) =>
    allPaths.map((path) => {
      const url = `${SITE_URL}/${locale}${path === '' ? '' : path}`
      return {
        url,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: path === '' ? 1 : path.startsWith('/departments/') ? 0.8 : path.startsWith('/blog/') ? 0.7 : 0.6,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [
              l,
              `${SITE_URL}/${l}${path === '' ? '' : path}`,
            ]),
          ),
        },
      }
    }),
  )
}
