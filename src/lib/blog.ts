import 'server-only'

import fs from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'

export type BlogCategory =
  | 'audiology'
  | 'cosmetic'
  | 'dental'
  | 'surgery'

export type BlogFrontmatter = {
  title: string
  description: string
  category: BlogCategory
  author: string
  date: string // ISO yyyy-mm-dd
  readTime: number
  image: string
  tags: string[]
}

export type BlogPostMeta = BlogFrontmatter & {
  slug: string
  locale: 'ar' | 'en'
}

export type BlogPost = BlogPostMeta & {
  body: string
}

const CONTENT_ROOT = path.join(process.cwd(), 'content', 'blog')

function parseFrontmatter(raw: string, slug: string, locale: 'ar' | 'en'): BlogPost {
  const { data, content } = matter(raw)
  const fm = data as Partial<BlogFrontmatter>

  return {
    slug,
    locale,
    title: String(fm.title ?? slug),
    description: String(fm.description ?? ''),
    category: (fm.category ?? 'audiology') as BlogCategory,
    author: String(fm.author ?? ''),
    date: String(fm.date ?? ''),
    readTime: Number(fm.readTime ?? 4),
    image: String(fm.image ?? ''),
    tags: Array.isArray(fm.tags) ? fm.tags.map(String) : [],
    body: content,
  }
}

export async function loadAllArticles(locale: 'ar' | 'en'): Promise<BlogPostMeta[]> {
  const dir = path.join(CONTENT_ROOT, locale)
  let entries: string[]
  try {
    entries = await fs.readdir(dir)
  } catch {
    return []
  }

  const articles: BlogPostMeta[] = []
  for (const file of entries) {
    if (!file.endsWith('.mdx')) continue
    const slug = file.replace(/\.mdx$/, '')
    const raw = await fs.readFile(path.join(dir, file), 'utf8')
    const parsed = parseFrontmatter(raw, slug, locale)
    const { body: _omit, ...meta } = parsed
    articles.push(meta)
  }

  // Sort by date desc.
  articles.sort((a, b) => b.date.localeCompare(a.date))
  return articles
}

export async function loadArticle(
  locale: 'ar' | 'en',
  slug: string,
): Promise<BlogPost | null> {
  try {
    const raw = await fs.readFile(
      path.join(CONTENT_ROOT, locale, `${slug}.mdx`),
      'utf8',
    )
    return parseFrontmatter(raw, slug, locale)
  } catch {
    return null
  }
}

export async function listAllSlugs(): Promise<Array<{ locale: 'ar' | 'en'; slug: string }>> {
  const result: Array<{ locale: 'ar' | 'en'; slug: string }> = []
  for (const locale of ['ar', 'en'] as const) {
    const dir = path.join(CONTENT_ROOT, locale)
    try {
      const entries = await fs.readdir(dir)
      for (const file of entries) {
        if (file.endsWith('.mdx')) {
          result.push({ locale, slug: file.replace(/\.mdx$/, '') })
        }
      }
    } catch {
      // ignore
    }
  }
  return result
}

export async function getRelated(
  locale: 'ar' | 'en',
  current: BlogPostMeta,
  limit = 3,
): Promise<BlogPostMeta[]> {
  const all = await loadAllArticles(locale)
  const sameCategory = all.filter(
    (a) => a.slug !== current.slug && a.category === current.category,
  )
  const others = all.filter(
    (a) => a.slug !== current.slug && a.category !== current.category,
  )
  return [...sameCategory, ...others].slice(0, limit)
}

/** Category → matching department slug for the "Book consultation" deep-link. */
export const CATEGORY_TO_DEPARTMENT: Record<BlogCategory, string> = {
  audiology: 'audiology',
  cosmetic: 'cosmetic',
  dental: 'dental',
  surgery: 'surgery',
}
