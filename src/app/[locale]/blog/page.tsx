import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { loadAllArticles, type BlogCategory, type BlogPostMeta } from '@/lib/blog'
import { canonicalUrl, languageAlternates } from '@/lib/seo'
import { BlogListClient } from '@/components/blog/BlogListClient'
import { getArticles } from '@/sanity/lib/queries'
import { urlForImage } from '@/sanity/lib/image'
import type { ArticleListItem } from '@/sanity/types'

type Params = { locale: string }

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) return {}

  const t = await getTranslations({ locale })

  return {
    title: t('blog.title'),
    description: t('blog.subtitle'),
    alternates: {
      canonical: canonicalUrl(locale, '/blog'),
      languages: languageAlternates('/blog'),
    },
    openGraph: {
      type: 'website',
      url: canonicalUrl(locale, '/blog'),
      title: `${t('blog.title')} | ${t('nav.brandName')}`,
      description: t('blog.subtitle'),
      siteName: t('nav.brandName'),
      locale: locale === 'ar' ? 'ar_SA' : 'en_US',
    },
  }
}

export default async function BlogPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const t = await getTranslations({ locale })
  const loc = locale as 'ar' | 'en'

  // Merge sources: Sanity articles take precedence per slug; MDX articles fill gaps.
  const [mdxArticles, sanityArticles] = await Promise.all([
    loadAllArticles(loc),
    getArticles(),
  ])

  const cmsMapped = (sanityArticles ?? [])
    .map((a) => mapSanityArticleToMeta(a, loc))
    .filter((a): a is BlogPostMeta => a !== null)

  const cmsSlugs = new Set(cmsMapped.map((a) => a.slug))
  const merged = [
    ...cmsMapped,
    ...mdxArticles.filter((m) => !cmsSlugs.has(m.slug)),
  ].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <>
      <section className="bg-cream-light pt-12 pb-8 sm:pt-14">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
            {t('nav.blog')}
          </span>
          <h1 className="mt-3 font-semibold leading-[1.15] text-teal-deep text-[clamp(1.9rem,3.8vw,2.8rem)]">
            {t('blog.title')}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {t('blog.subtitle')}
          </p>
        </div>
      </section>

      <BlogListClient articles={merged} locale={loc} />
    </>
  )
}

/** Convert a Sanity article into the BlogPostMeta shape used by the list. */
function mapSanityArticleToMeta(
  a: ArticleListItem,
  locale: 'ar' | 'en',
): BlogPostMeta | null {
  const slug = a.slug?.[locale]?.current || a.slug?.[locale === 'ar' ? 'en' : 'ar']?.current
  if (!slug) return null

  const validCats: BlogCategory[] = ['audiology', 'cosmetic', 'dental', 'surgery']
  const deptSlug = a.category?.slug?.current
  const category: BlogCategory =
    deptSlug && (validCats as string[]).includes(deptSlug)
      ? (deptSlug as BlogCategory)
      : 'audiology'

  const imageUrl = urlForImage(a.featuredImage)?.width(1600).url() ?? ''

  const authorName =
    (a.author?.titlePrefix?.[locale] || 'د.') +
      ' ' +
      (a.author?.name?.[locale] || '') ||
    a.authorOverride?.[locale] ||
    ''

  return {
    slug,
    locale,
    title: a.title?.[locale] || a.title?.[locale === 'ar' ? 'en' : 'ar'] || '—',
    description: a.excerpt?.[locale] || '',
    category,
    author: authorName.trim() || '—',
    date: a.publishedAt?.slice(0, 10) || '',
    readTime: a.readTime ?? 4,
    image: imageUrl,
    tags: [],
  }
}
