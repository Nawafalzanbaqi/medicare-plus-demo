import { GridSkeleton, Skeleton } from '@/components/shared/skeletons'

export default function Loading() {
  return (
    <div className="bg-cream-light" aria-busy="true" aria-live="polite">
      <section className="container mx-auto px-4 py-12">
        <div className="mb-10 space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-2/3 max-w-xl" />
          <Skeleton className="h-3.5 w-full max-w-2xl" />
        </div>
        <GridSkeleton count={9} imageAspect="4/3" />
      </section>
    </div>
  )
}
