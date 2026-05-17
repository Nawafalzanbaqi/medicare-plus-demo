import { GridSkeleton, Skeleton } from '@/components/shared/skeletons'

export default function Loading() {
  return (
    <div className="bg-cream-light" aria-busy="true" aria-live="polite">
      <section className="container mx-auto px-4 py-12">
        <div className="mb-10 space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-2/3 max-w-md" />
          <Skeleton className="h-3.5 w-full max-w-xl" />
        </div>
        <GridSkeleton count={6} imageAspect="16/10" />
      </section>
    </div>
  )
}
