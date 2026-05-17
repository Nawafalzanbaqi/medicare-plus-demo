import { GridSkeleton, Skeleton } from '@/components/shared/skeletons'

export default function Loading() {
  return (
    <div className="bg-cream-light" aria-busy="true" aria-live="polite">
      <section className="container mx-auto px-4 py-12">
        <div className="mb-10 space-y-3">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-1/2 max-w-md" />
          <Skeleton className="h-3.5 w-full max-w-xl" />
        </div>
        <GridSkeleton count={8} imageAspect="square" />
      </section>
    </div>
  )
}
