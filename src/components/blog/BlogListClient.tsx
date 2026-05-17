'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslations } from 'next-intl'
import { ArticleCard } from './ArticleCard'
import type { BlogCategory, BlogPostMeta } from '@/lib/blog'
import { cn } from '@/lib/utils'

const CATEGORIES: (BlogCategory | 'all')[] = [
  'all',
  'audiology',
  'cosmetic',
  'dental',
  'surgery',
]

type Props = {
  articles: BlogPostMeta[]
  locale: 'ar' | 'en'
}

export function BlogListClient({ articles, locale }: Props) {
  const t = useTranslations('blog')
  const [active, setActive] = useState<BlogCategory | 'all'>('all')

  const filtered = useMemo(
    () =>
      active === 'all'
        ? articles
        : articles.filter((a) => a.category === active),
    [active, articles],
  )

  return (
    <>
      {/* Category pills */}
      <div className="container mx-auto px-4 pb-8">
        <div
          role="tablist"
          aria-label={t('filterBy')}
          className="flex flex-wrap items-center gap-2"
        >
          {CATEGORIES.map((c) => {
            const isActive = c === active
            return (
              <button
                key={c}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(c)}
                className={cn(
                  'h-9 rounded-full border px-4 text-sm font-medium transition-all',
                  isActive
                    ? 'border-teal-deep bg-teal-deep text-cream-light'
                    : 'border-line bg-white text-teal-deep/80 hover:border-teal-deep/40',
                )}
              >
                {c === 'all' ? t('allCategories') : t(`categories.${c}`)}
              </button>
            )
          })}
        </div>
      </div>

      {/* Grid */}
      <div className="container mx-auto px-4 pb-20 sm:pb-24">
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mx-auto max-w-md rounded-2xl border border-line bg-white p-10 text-center text-muted-foreground shadow-soft"
            >
              {t('empty')}
            </motion.div>
          ) : (
            <motion.ul
              key={active}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid gap-6 sm:gap-7 sm:grid-cols-2 lg:grid-cols-3"
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((a, i) => (
                  <motion.li
                    key={a.slug}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.28, delay: i * 0.04 }}
                  >
                    <ArticleCard article={a} locale={locale} priority={i < 3} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
