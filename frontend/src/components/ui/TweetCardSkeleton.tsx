export function TweetCardSkeleton() {
  return (
    <div className="flex gap-3 p-4 border-b border-divider animate-pulse">
      <div className="w-10 h-10 rounded-full bg-default-200 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-default-200 rounded w-1/3" />
        <div className="h-4 bg-default-200 rounded w-full" />
        <div className="h-4 bg-default-200 rounded w-2/3" />
      </div>
    </div>
  )
}
