import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { EmptyState } from './EmptyState'

interface InfiniteScrollListProps<T> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
  hasNextPage: boolean
  loading: boolean
  onLoadMore: () => void
  emptyMessage?: string
  loadingComponent?: React.ReactNode
}

export function InfiniteScrollList<T extends { id: string }>({
  items,
  renderItem,
  hasNextPage,
  loading,
  onLoadMore,
  emptyMessage,
  loadingComponent,
}: InfiniteScrollListProps<T>) {
  const { sentinelRef } = useInfiniteScroll({ hasNextPage, loading, onLoadMore })

  return (
    <div>
      {items.map(renderItem)}
      {loading && (loadingComponent ?? <div className="p-4 text-center text-default-400">読み込み中...</div>)}
      {!loading && items.length === 0 && <EmptyState message={emptyMessage} />}
      <div ref={sentinelRef} className="h-4" />
    </div>
  )
}
