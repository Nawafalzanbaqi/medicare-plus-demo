import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { ChevronRight, Clock } from 'lucide-react'
import { WhatsappLogoIcon } from '@phosphor-icons/react/dist/ssr'
import { routing } from '@/i18n/routing'
import {
  CATEGORY_TO_DEPARTMENT,
  getRelated,
  listAllSlugs,
  loadArticle,
  type BlogCategory,
} from '@/lib/blog'
import { Link } from '@/i18n/navigation'
import { canonicalUrl, languageAlternates, SITE_URL } from '@/lib/seo'
import { Button } from '@/components/ui/button'
import { JsonLd } from '@/components/shared/JsonLd'
import { ArticleCard } from '@/components/blog/ArticleCard'
import { articleMdxComponents } from '@/components/blog/mdxComponents'
import { PortableArticleBody } from '@/components/blog/PortableArticleBody'
import { SafeImage } from '@/components/shared/SafeImage'
import { getWhatsAppUrl } from '@/lib/whatsapp'
import { getArticleBySlug } from '@/sanity/lib/queries'
import { urlForImage } from '@/sanity/lib/image'
import type { ArticleFull, PortableTextBlock } from '@/sanity/types'

type Params = { locale: string; slug: string }

export async function generateStaticParams() {
  const all = await listAllSlugs()
  // Return slugs only; locale is resolved by the parent [locale] segment.
  const uniqueSlugs = Array.from(new Set(all.map((a) => a.slug)))
  return uniqueSlugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const loc = locale as 'ar' | 'en'

  // Try Sanity first, then MDX.
  const sanity = await getArticleBySlug(slug)
  const article = sanity
    ? sanityArticleToView(sanity, loc)
    : await loadArticle(loc, slug)
  if (!article) return {}

  const path = `/blog/${slug}`
  const url = canonicalUrl(locale, path)

  return {
    title: article.title,
    description: article.description,
    alternates: {
      canonical: url,
      languages: languageAlternates(path),
    },
    openGraph: {
      type: 'article',
      url,
      title: article.title,
      description: article.description,
      images: article.image ? [{ url: article.image }] : undefined,
      siteName: 'MediCare Plus',
      locale: locale === 'ar' ? 'ar_SA' : 'en_US',
      publishedTime: article.date,
      authors: [article.author],
      tags: article.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
      images: article.image ? [article.image] : undefined,
    },
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<Params>
}) {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const loc = locale as 'ar' | 'en'

  // Prefer Sanity content; fall back to MDX bundles in /content/blog.
  const [sanity, mdx] = await Promise.all([
    getArticleBySlug(slug),
    loadArticle(loc, slug),
  ])
  const view: ArticleView | null = sanity
    ? sanityArticleToView(sanity, loc)
    : mdx
      ? {
          source: 'mdx',
          title: mdx.title,
          description: mdx.description,
          category: mdx.category,
          author: mdx.author,
          date: mdx.date,
          readTime: mdx.readTime,
          image: mdx.image,
          slug: mdx.slug,
          tags: mdx.tags,
          mdxBody: mdx.body,
        }
      : null
  if (!view) notFound()

  // Use a synthetic ArticleMeta for the "related" lookup. MDX path uses real
  // metadata; Sanity-only articles share the category but skip itself.
  const article = view
  const t = await getTranslations({ locale })
  const format = await getFormatter({ locale })

  const related = mdx
    ? await getRelated(loc, mdx)
    : [] // For now Sanity-only articles don't surface related-from-MDX.

  const url = canonicalUrl(locale, `/blog/${article.slug}`)
  const shareMessage = t('blog.shareTemplate', {
    title: article.title,
    url,
  })
  const shareHref = getWhatsAppUrl({
    type: 'general',
    locale: loc,
    notes: shareMessage,
  })

  const departmentSlug = CATEGORY_TO_DEPARTMENT[article.category]

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    '@id': `${url}#article`,
    headline: article.title,
    description: article.description,
    inLanguage: locale,
    datePublished: article.date,
    dateModified: article.date,
    author: { '@type': 'Person', name: article.author },
    image: article.image,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    publisher: { '@id': `${SITE_URL}/${locale}#business` },
    about: { '@type': 'MedicalSpecialty', name: t(`blog.categories.${article.category}`) },
  }

  return (
    <>
      <JsonLd data={articleJsonLd} />

      <article className="bg-cream-light">
        <div className="container mx-auto max-w-3xl px-4 pt-10 sm:pt-12">
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/" className="transition-colors hover:text-teal-deep">
              {t('departments.common.breadcrumbHome')}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
            <Link href="/blog" className="transition-colors hover:text-teal-deep">
              {t('blog.breadcrumbBlog')}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
            <span className="line-clamp-1 text-teal-deep">{article.title}</span>
          </nav>

          {/* Header */}
          <header className="mt-6">
            <span className="inline-flex items-center rounded-full bg-gold/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold">
              {t(`blog.categories.${article.category}`)}
            </span>
            <h1 className="mt-4 font-semibold leading-[1.15] text-teal-deep text-[clamp(1.9rem,4vw,3rem)]">
              {article.title}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {article.description}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="font-medium text-teal-deep">{article.author}</span>
              <span>
                {format.dateTime(new Date(article.date), { dateStyle: 'long' })}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                {article.readTime} {t('blog.minutes')}
              </span>
            </div>
          </header>

          {/* Hero image */}
          <SafeImage
            src={article.image && article.image.length > 0 ? article.image : null}
            alt={article.title}
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            aspect="video"
            wrapperClassName="mt-8 shadow-medium"
            locale={loc}
          />

          {/* Body */}
          <div className="prose-article mt-10 pb-12">
            {view.source === 'mdx' ? (
              <MDXRemote source={view.mdxBody!} components={articleMdxComponents} />
            ) : (
              <PortableArticleBody blocks={view.portableBody} />
            )}
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 border-t border-line pt-8">
            <Button
              render={
                <a href={shareHref} target="_blank" rel="noopener noreferrer" />
              }
              nativeButton={false}
              size="lg"
              className="h-12 rounded-lg bg-teal-deep text-cream-light hover:bg-teal"
            >
              <WhatsappLogoIcon size={18} weight="fill" className="me-2" />
              {t('blog.shareWhatsApp')}
            </Button>
            <Button
              render={<Link href={`/departments/${departmentSlug}`} />}
              nativeButton={false}
              variant="outline"
              size="lg"
              className="h-12 rounded-lg border-teal-deep/25 px-5 text-teal-deep hover:bg-cream hover:text-teal-deep"
            >
              {t('blog.bookConsultation')}
            </Button>
          </div>

          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-teal-deep/80"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="bg-cream-light py-16 sm:py-20">
            <div className="container mx-auto px-4">
              <h2 className="mb-8 text-center font-semibold text-teal-deep text-[clamp(1.4rem,2.6vw,1.8rem)]">
                {t('blog.relatedArticles')}
              </h2>
              <div className="grid gap-6 sm:gap-7 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((a) => (
                  <ArticleCard
                    key={a.slug}
                    article={a}
                    locale={locale as 'ar' | 'en'}
                  />
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
    </>
  )
}

type ArticleView = {
  source: 'mdx' | 'sanity'
  title: string
  description: string
  category: BlogCategory
  author: string
  date: string
  readTime: number
  image: string
  slug: string
  tags: string[]
  mdxBody?: string
  portableBody?: PortableTextBlock[]
}

function sanityArticleToView(a: ArticleFull, locale: 'ar' | 'en'): ArticleView {
  const validCats: BlogCategory[] = ['audiology', 'cosmetic', 'dental', 'surgery']
  const deptSlug = a.category?.slug?.current
  const category: BlogCategory =
    deptSlug && (validCats as string[]).includes(deptSlug)
      ? (deptSlug as BlogCategory)
      : 'audiology'

  const authorName =
    [a.author?.titlePrefix?.[locale], a.author?.name?.[locale]]
      .filter(Boolean)
      .join(' ')
      .trim() ||
    a.authorOverride?.[locale] ||
    '—'

  const imageUrl = urlForImage(a.featuredImage)?.width(1600).url() ?? ''

  const slug = a.slug?.[locale]?.current ?? ''

  return {
    source: 'sanity',
    title: a.title?.[locale] || a.title?.[locale === 'ar' ? 'en' : 'ar'] || '—',
    description: a.excerpt?.[locale] || '',
    category,
    author: authorName,
    date: a.publishedAt?.slice(0, 10) ?? '',
    readTime: a.readTime ?? 4,
    image: imageUrl,
    slug,
    tags: a.tags ?? [],
    portableBody: (a.content?.[locale] ?? null) as PortableTextBlock[] | undefined,
  }
}
