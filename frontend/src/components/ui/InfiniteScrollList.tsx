import { useRef } from 'react'
import { Spinner } from '@heroui/react'
import { useInfiniteScroll } from '@/lib/hooks/useInfiniteScroll'
import { EmptyState } from './EmptyState'

type InfiniteScrollListProps<T> = {
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
  const sentinelRef = useRef<HTMLDivElement>(null)
  useInfiniteScroll(sentinelRef, { hasNextPage, loading, onLoadMore })

  return (
    <div>
      {items.map(renderItem)}
      {loading && (loadingComponent ?? <div className="flex justify-center p-4"><Spinner size="sm" /></div>)}
      {!loading && items.length === 0 && <EmptyState message={emptyMessage} />}
      {hasNextPage && <div ref={sentinelRef} className="h-4" />}
    </div>
  )
}
