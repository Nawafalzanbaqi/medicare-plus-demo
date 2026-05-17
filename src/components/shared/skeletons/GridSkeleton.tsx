import { cn } from '@/lib/utils'
import { CardSkeleton } from './CardSkeleton'

type Props = {
  count?: number
  className?: string
  imageAspect?: '16/10' | '4/3' | 'square' | 'video'
}

export function GridSkeleton({ count = 6, className, imageAspect = '16/10' }: Props) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3',
        className,
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} imageAspect={imageAspect} />
      ))}
    </div>
  )
}
