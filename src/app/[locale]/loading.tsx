import { HeroSkeleton } from '@/components/shared/skeletons'

export default function Loading() {
  return (
    <div className="bg-cream-light" aria-busy="true" aria-live="polite">
      <HeroSkeleton />
    </div>
  )
}
