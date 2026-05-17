import {
  GridSkeleton,
  HeroSkeleton,
  Skeleton,
} from '@/components/shared/skeletons'

export default function Loading() {
  return (
    <div className="bg-cream-light" aria-busy="true" aria-live="polite">
      <HeroSkeleton />
      <section className="container mx-auto px-4 py-12">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-7 w-72" />
          <Skeleton className="h-3 w-96 max-w-full" />
        </div>
        <GridSkeleton count={6} imageAspect="4/3" />
      </section>
    </div>
  )
}
