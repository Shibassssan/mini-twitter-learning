import { Skeleton } from '@heroui/react'

export function ProfileSkeleton() {
  return (
    <div>
      <Skeleton className="h-[150px] w-full rounded-none" />
      <div className="px-4">
        <Skeleton className="-mt-10 w-20 h-20 rounded-full border-4 border-background" />
        <div className="mt-3 space-y-2">
          <Skeleton className="h-5 w-32 rounded-lg" />
          <Skeleton className="h-4 w-24 rounded-lg" />
          <Skeleton className="h-4 w-64 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
