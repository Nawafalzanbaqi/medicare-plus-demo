type Props = {
  eyebrow?: string | null
  title: string
  description?: string | null
  align?: 'center' | 'start'
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'center',
}: Props) {
  const alignClass = align === 'center' ? 'mx-auto text-center' : 'text-start'
  return (
    <div
      className={`${alignClass} max-w-[600px] mb-10 sm:mb-12 lg:mb-14`}
    >
      {eyebrow && (
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
          {eyebrow}
        </span>
      )}
      <h2 className="mt-3 font-semibold leading-[1.2] text-teal-deep text-[clamp(1.7rem,3.2vw,2.4rem)]">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  )
}
