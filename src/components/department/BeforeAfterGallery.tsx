import { useTranslations } from 'next-intl'
import { SafeImage } from '@/components/shared/SafeImage'

type Pair = {
  caption: string
  before: string | null
  after: string | null
}

type Props = {
  pairs: Pair[]
}

export function BeforeAfterGallery({ pairs }: Props) {
  const t = useTranslations('departments.common.gallery')

  return (
    <div className="grid gap-6 sm:gap-7 md:grid-cols-2 lg:grid-cols-3">
      {pairs.map((pair, i) => (
        <figure
          key={i}
          className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft"
        >
          <div className="grid grid-cols-2">
            <div className="relative">
              <SafeImage
                src={pair.before}
                alt={`${t('before')} — ${pair.caption}`}
                sizes="(max-width: 768px) 50vw, 25vw"
                aspect="square"
                rounded={false}
              />
              <span className="absolute top-3 inline-flex items-center rounded-full bg-teal-deep/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-cream-light"
                style={{ insetInlineStart: '0.75rem' }}>
                {t('before')}
              </span>
            </div>
            <div className="relative">
              <SafeImage
                src={pair.after}
                alt={`${t('after')} — ${pair.caption}`}
                sizes="(max-width: 768px) 50vw, 25vw"
                aspect="square"
                rounded={false}
              />
              <span className="absolute top-3 inline-flex items-center rounded-full bg-gold px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-teal-deep"
                style={{ insetInlineEnd: '0.75rem' }}>
                {t('after')}
              </span>
            </div>
          </div>
          <figcaption className="border-t border-line p-4 text-center text-sm font-medium text-teal-deep">
            {pair.caption}
          </figcaption>
        </figure>
      ))}
    </div>
  )
}
