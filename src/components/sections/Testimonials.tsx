'use client'

import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { StarIcon } from '@phosphor-icons/react/dist/ssr'
import useEmblaCarousel from 'embla-carousel-react'
import AutoScroll from 'embla-carousel-auto-scroll'
import { useLocale, useTranslations } from 'next-intl'
import { TESTIMONIALS, type Testimonial } from '@/lib/data'
import { cn } from '@/lib/utils'
import type { Locale, TestimonialsSection } from '@/sanity/types'

const AVATAR_GRADIENTS = [
  'from-teal-deep to-teal',
  'from-teal to-teal-light',
  'from-gold to-gold-soft',
  'from-teal-deep to-gold',
  'from-teal-light to-gold-soft',
  'from-teal to-gold',
] as const

type Props = {
  data?: TestimonialsSection
  /** Optional testimonials source — falls back to the bundled TESTIMONIALS array. */
  testimonials?: Testimonial[]
}

export function Testimonials({ data, testimonials }: Props) {
  const list = testimonials && testimonials.length > 0 ? testimonials : TESTIMONIALS
  const t = useTranslations('testimonials')
  const tFeatured = useTranslations('featuredDepartments')
  const tAll = useTranslations('allDepartments')
  const locale = useLocale() as Locale

  const eyebrow = data?.eyebrow?.[locale] || t('eyebrow')
  const title = data?.title?.[locale] || t('title')
  const description = data?.description?.[locale] || t('description')
  const autoScrollEnabled = data?.autoScroll !== false

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      direction: locale === 'ar' ? 'rtl' : 'ltr',
      loop: true,
      align: 'start',
      containScroll: 'trimSnaps',
    },
    [
      AutoScroll({
        playOnInit: autoScrollEnabled,
        speed: 0.6,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
        stopOnFocusIn: true,
      }),
    ],
  )

  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const handlePrev = useCallback(() => {
    if (!emblaApi) return
    emblaApi.plugins().autoScroll?.stop()
    emblaApi.scrollPrev()
  }, [emblaApi])

  const handleNext = useCallback(() => {
    if (!emblaApi) return
    emblaApi.plugins().autoScroll?.stop()
    emblaApi.scrollNext()
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    const update = () => {
      setCanPrev(emblaApi.canScrollPrev())
      setCanNext(emblaApi.canScrollNext())
    }
    update()
    emblaApi.on('select', update).on('reInit', update)
  }, [emblaApi])

  const deptName = (slug: Testimonial['departmentSlug']) => {
    const featured = ['cosmetic', 'surgery', 'audiology']
    return featured.includes(slug)
      ? tFeatured(`${slug}.name`)
      : tAll(`${slug}.name`)
  }

  return (
    <section className="bg-cream py-20 sm:py-24 lg:py-28">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
            {eyebrow}
          </span>
          <h2 className="mt-3 font-semibold leading-[1.2] text-teal-deep text-[clamp(1.8rem,3.2vw,2.4rem)]">
            {title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-5">
              {list.map((tst, i) => (
                <article
                  key={tst.id}
                  className="flex min-w-0 shrink-0 grow-0 basis-full flex-col rounded-2xl border border-line bg-white p-6 shadow-soft sm:basis-1/2 lg:basis-1/3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br font-semibold text-cream-light',
                        AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length],
                      )}
                    >
                      {tst.name[locale].charAt(0)}
                    </span>
                    <div className="flex flex-col leading-tight">
                      <span className="text-sm font-semibold text-teal-deep">
                        {tst.name[locale]}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {deptName(tst.departmentSlug)}
                      </span>
                    </div>
                  </div>

                  <div
                    className="mt-4 flex items-center gap-0.5"
                    role="img"
                    aria-label={`${tst.rating} / 5`}
                  >
                    {Array.from({ length: 5 }).map((_, j) => (
                      <StarIcon
                        key={j}
                        size={16}
                        weight={j < tst.rating ? 'fill' : 'regular'}
                        className={
                          j < tst.rating ? 'text-gold' : 'text-line'
                        }
                      />
                    ))}
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-ink/80">
                    {tst.comment[locale]}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handlePrev}
              disabled={!canPrev}
              aria-label={t('controls.prev')}
              className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-teal-deep transition-colors hover:border-gold hover:text-gold disabled:opacity-40 disabled:hover:border-line disabled:hover:text-teal-deep"
            >
              <ChevronLeft className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!canNext}
              aria-label={t('controls.next')}
              className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-teal-deep transition-colors hover:border-gold hover:text-gold disabled:opacity-40 disabled:hover:border-line disabled:hover:text-teal-deep"
            >
              <ChevronRight className="h-5 w-5 rtl:rotate-180" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
