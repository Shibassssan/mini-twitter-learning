export function UserCardSkeleton() {
  return (
    <div className="flex gap-3 p-4 border-b border-divider animate-pulse">
      <div className="w-10 h-10 rounded-full bg-default-200 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-default-200 rounded w-24" />
        <div className="h-3 bg-default-200 rounded w-16" />
      </div>
    </div>
  )
}

export function UserCardSkeletonList({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <UserCardSkeleton key={i} />
      ))}
    </>
  )
}
