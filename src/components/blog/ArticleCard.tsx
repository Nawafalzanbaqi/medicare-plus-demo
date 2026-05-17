import { Clock } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useFormatter, useTranslations } from 'next-intl'
import { SafeImage } from '@/components/shared/SafeImage'
import type { BlogPostMeta } from '@/lib/blog'

type Props = {
  article: BlogPostMeta
  locale: 'ar' | 'en'
  priority?: boolean
}

export function ArticleCard({ article, locale, priority }: Props) {
  const t = useTranslations('blog')
  const format = useFormatter()
  const imageSrc = article.image && article.image.length > 0 ? article.image : null

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:shadow-medium">
      <Link href={`/blog/${article.slug}`} className="relative block">
        <SafeImage
          src={imageSrc}
          alt={article.title}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          aspect="16/10"
          rounded={false}
          locale={locale}
          priority={priority}
          className="transition-transform duration-500 group-hover:scale-105"
        />
        <span
          className="absolute top-3 inline-flex items-center rounded-full bg-gold px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-teal-deep shadow-soft"
          style={{ insetInlineStart: '0.75rem' }}
        >
          {t(`categories.${article.category}`)}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-semibold leading-snug text-teal-deep sm:text-lg">
          <Link href={`/blog/${article.slug}`} className="hover:text-gold transition-colors">
            {article.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {article.description}
        </p>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3 text-xs text-muted-foreground">
          <span>
            {format.dateTime(new Date(article.date), { dateStyle: 'medium' })}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {article.readTime} {t('minutes')}
          </span>
        </div>
      </div>
    </article>
  )
}
