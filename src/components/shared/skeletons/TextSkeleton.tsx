import { cn } from '@/lib/utils'
import { Skeleton } from './Skeleton'

type Props = {
  lines?: number
  widths?: string[]
  className?: string
}

const DEFAULT_WIDTHS = ['100%', '92%', '78%']

export function TextSkeleton({ lines = 3, widths = DEFAULT_WIDTHS, className }: Props) {
  return (
    <span className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-3"
          style={{ width: widths[i % widths.length] }}
        />
      ))}
    </span>
  )
}
