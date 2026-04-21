import { Skeleton } from '@heroui/react'

export function TweetCardSkeleton() {
  return (
    <div className="mx-3 my-1.5 flex gap-3 p-4 rounded-2xl border border-border/60 bg-surface/60">
      <Skeleton className="w-10 h-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2.5">
        <div className="flex gap-2">
          <Skeleton className="h-3.5 w-24 rounded-lg" />
          <Skeleton className="h-3.5 w-16 rounded-lg" />
        </div>
        <Skeleton className="h-4 w-full rounded-lg" />
        <Skeleton className="h-4 w-3/4 rounded-lg" />
      </div>
    </div>
  )
}
