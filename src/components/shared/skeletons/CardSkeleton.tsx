import { cn } from '@/lib/utils'
import { Skeleton } from './Skeleton'

type Props = {
  className?: string
  /** Aspect ratio for the image area. Defaults to 16/10. */
  imageAspect?: '16/10' | '4/3' | 'square' | 'video'
}

const ASPECT_CLASS: Record<NonNullable<Props['imageAspect']>, string> = {
  '16/10': 'aspect-[16/10]',
  '4/3': 'aspect-[4/3]',
  square: 'aspect-square',
  video: 'aspect-video',
}

export function CardSkeleton({ className, imageAspect = '16/10' }: Props) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 shadow-soft',
        className,
      )}
      aria-hidden="true"
    >
      <Skeleton className={cn('w-full rounded-xl', ASPECT_CLASS[imageAspect])} />
      <div className="space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="space-y-2 pt-1">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-11/12" />
        <Skeleton className="h-3 w-3/4" />
      </div>
      <div className="pt-2">
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  )
}
