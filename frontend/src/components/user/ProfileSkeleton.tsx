export function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-[150px] bg-default-200" />
      <div className="px-4">
        <div className="-mt-10 w-20 h-20 rounded-full bg-default-300 border-4 border-background" />
        <div className="mt-3 space-y-2">
          <div className="h-5 bg-default-200 rounded w-32" />
          <div className="h-4 bg-default-200 rounded w-24" />
          <div className="h-4 bg-default-200 rounded w-64" />
        </div>
      </div>
    </div>
  )
}
