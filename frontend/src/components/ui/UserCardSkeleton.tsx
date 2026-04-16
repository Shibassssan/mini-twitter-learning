import { Skeleton } from '@heroui/react'

export function UserCardSkeleton() {
  return (
    <div className="flex gap-3 p-4 border-b border-divider">
      <Skeleton className="w-10 h-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-24 rounded-lg" />
        <Skeleton className="h-3 w-16 rounded-lg" />
      </div>
    </div>
  )
}

export function UserCardSkeletonList({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        // biome-ignore lint/suspicious/noArrayIndexKey: 固定件数のプレースホルダーで順序は不変
        return <UserCardSkeleton key={i} />
      })}
    </>
  )
}
