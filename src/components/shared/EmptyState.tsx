import type { Icon } from '@phosphor-icons/react'
import { ClipboardIcon, WhatsappLogoIcon } from '@phosphor-icons/react/dist/ssr'
import { Button } from '@/components/ui/button'

type Props = {
  icon?: Icon
  title: string
  description?: string
  ctaLabel?: string
  ctaHref?: string
}

export function EmptyState({
  icon: IconComponent = ClipboardIcon,
  title,
  description,
  ctaLabel,
  ctaHref,
}: Props) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-line bg-white p-10 text-center shadow-soft">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gold/10 ring-1 ring-gold/20">
        <IconComponent
          size={28}
          weight="duotone"
          className="text-gold"
          aria-hidden="true"
        />
      </span>
      <h3 className="mt-5 text-lg font-semibold text-teal-deep">{title}</h3>
      {description && (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {ctaLabel && ctaHref && (
        <Button
          render={
            <a href={ctaHref} target="_blank" rel="noopener noreferrer" />
          }
          nativeButton={false}
          className="mt-5 rounded-lg bg-teal-deep text-cream-light hover:bg-teal"
        >
          <WhatsappLogoIcon size={16} weight="fill" className="me-2" />
          {ctaLabel}
        </Button>
      )}
    </div>
  )
}
