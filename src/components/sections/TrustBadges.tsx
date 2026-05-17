import { useTranslations } from 'next-intl'

const LOGOS = ['ministry', 'vision', 'bupa', 'tawuniya', 'jci'] as const

export function TrustBadges() {
  const t = useTranslations('trustBadges')

  return (
    <section className="border-y border-line bg-cream">
      <div className="container mx-auto px-4 py-12 sm:py-14">
        <div className="mx-auto mb-8 flex items-center justify-center gap-4">
          <span aria-hidden="true" className="h-px w-10 bg-gold/40" />
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-deep/70">
            {t('eyebrow')}
          </span>
          <span aria-hidden="true" className="h-px w-10 bg-gold/40" />
        </div>

        <ul className="grid grid-cols-2 items-center justify-items-center gap-y-8 sm:grid-cols-3 md:grid-cols-5">
          {LOGOS.map((key) => (
            <li
              key={key}
              className="last:col-span-2 sm:last:col-span-1"
            >
              <BadgeLogo
                name={t(`logos.${key}.name`)}
                subtitle={t(`logos.${key}.subtitle`)}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function BadgeLogo({ name, subtitle }: { name: string; subtitle: string }) {
  return (
    <div className="group flex flex-col items-center gap-2 grayscale opacity-60 transition-all duration-300 hover:opacity-100 hover:grayscale-0 focus-within:opacity-100 focus-within:grayscale-0">
      <span
        aria-hidden="true"
        className="grid h-14 w-14 place-items-center rounded-full border border-teal-deep/15 bg-white shadow-soft transition-colors group-hover:border-gold/50"
      >
        <span className="text-[10px] font-bold uppercase tracking-wider text-teal-deep">
          {subtitle}
        </span>
      </span>
      <span className="max-w-[10rem] text-center text-xs font-medium text-teal-deep/80">
        {name}
      </span>
    </div>
  )
}
