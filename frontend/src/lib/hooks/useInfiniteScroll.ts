import { useEffect, useRef } from 'react'

interface UseInfiniteScrollOptions {
  hasNextPage: boolean
  loading: boolean
  onLoadMore: () => void
}

export function useInfiniteScroll(
  sentinelRef: React.RefObject<HTMLElement | null>,
  { hasNextPage, loading, onLoadMore }: UseInfiniteScrollOptions,
) {
  const onLoadMoreRef = useRef(onLoadMore)
  onLoadMoreRef.current = onLoadMore
  const loadingRef = useRef(loading)
  loadingRef.current = loading

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first?.isIntersecting && !loadingRef.current) {
          onLoadMoreRef.current()
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [sentinelRef, hasNextPage])
}
