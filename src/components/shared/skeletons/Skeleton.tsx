import { cn } from '@/lib/utils'

type SkeletonProps = React.HTMLAttributes<HTMLSpanElement>

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      {...props}
      className={cn('nahda-skeleton block rounded-md', className)}
    />
  )
}
