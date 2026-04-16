import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { useRef } from 'react'
import { useInfiniteScroll } from './useInfiniteScroll'

describe('useInfiniteScroll', () => {
  let ioCallback: IntersectionObserverCallback | null = null
  let observe: ReturnType<typeof vi.fn>
  let disconnect: ReturnType<typeof vi.fn>

  beforeEach(() => {
    observe = vi.fn()
    disconnect = vi.fn()
    ioCallback = null

    globalThis.IntersectionObserver = class {
      constructor(cb: IntersectionObserverCallback) {
        ioCallback = cb
      }
      observe = observe
      disconnect = disconnect
      unobserve = vi.fn()
      takeRecords = () => []
      root = null
      rootMargin = ''
      thresholds = []
    } as unknown as typeof IntersectionObserver
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  function TestHost({
    hasNextPage,
    loading,
    onLoadMore,
  }: {
    hasNextPage: boolean
    loading: boolean
    onLoadMore: () => void
  }) {
    const ref = useRef<HTMLDivElement | null>(null)
    useInfiniteScroll(ref, { hasNextPage, loading, onLoadMore })
    return hasNextPage ? <div ref={ref} data-testid="sentinel" /> : <span data-testid="empty" />
  }

  it('hasNextPage が false のとき observer を作らない', () => {
    render(
      <TestHost hasNextPage={false} loading={false} onLoadMore={vi.fn()} />,
    )
    expect(observe).not.toHaveBeenCalled()
  })

  it('交差時に onLoadMore を呼ぶ', () => {
    const onLoadMore = vi.fn()
    render(<TestHost hasNextPage loading={false} onLoadMore={onLoadMore} />)

    const sentinel = screen.getByTestId('sentinel')
    expect(observe).toHaveBeenCalledWith(sentinel)

    ioCallback?.(
      [{ isIntersecting: true, target: sentinel } as unknown as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )
    expect(onLoadMore).toHaveBeenCalledTimes(1)
  })

  it('loading 中は onLoadMore を呼ばない', () => {
    const onLoadMore = vi.fn()
    render(<TestHost hasNextPage loading onLoadMore={onLoadMore} />)

    const sentinel = screen.getByTestId('sentinel')
    ioCallback?.(
      [{ isIntersecting: true, target: sentinel } as unknown as IntersectionObserverEntry],
      {} as IntersectionObserver,
    )
    expect(onLoadMore).not.toHaveBeenCalled()
  })
})
