import { Skeleton } from '@heroui/react'

export function TweetCardSkeleton() {
  return (
    <div className="flex gap-3 p-4 border-b border-divider">
      <Skeleton className="w-10 h-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/3 rounded-lg" />
        <Skeleton className="h-4 w-full rounded-lg" />
        <Skeleton className="h-4 w-2/3 rounded-lg" />
      </div>
    </div>
  )
}
