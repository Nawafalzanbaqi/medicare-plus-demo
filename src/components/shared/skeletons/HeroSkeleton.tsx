import { cn } from '@/lib/utils'
import { Skeleton } from './Skeleton'

type Props = {
  className?: string
  /** Reverse columns visually (image on the start side). */
  reverse?: boolean
}

export function HeroSkeleton({ className, reverse = false }: Props) {
  return (
    <section
      className={cn('bg-cream-light', className)}
      aria-busy="true"
      aria-live="polite"
    >
      <div className="container mx-auto grid items-center gap-10 px-4 py-12 md:grid-cols-2 lg:py-20">
        <div
          className={cn('space-y-5 order-2 md:order-1', reverse && 'md:order-2')}
        >
          <Skeleton className="h-6 w-40 rounded-full" />
          <div className="space-y-3">
            <Skeleton className="h-9 w-11/12" />
            <Skeleton className="h-9 w-3/4" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-10/12" />
            <Skeleton className="h-3.5 w-9/12" />
          </div>
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-11 w-36 rounded-lg" />
            <Skeleton className="h-11 w-28 rounded-lg" />
          </div>
        </div>
        <div className={cn('order-1 md:order-2', reverse && 'md:order-1')}>
          <Skeleton className="aspect-[4/3] w-full rounded-3xl" />
        </div>
      </div>
    </section>
  )
}
