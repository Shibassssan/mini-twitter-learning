import { renderHook } from '@testing-library/react'
import { type Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useInfiniteScroll } from './useInfiniteScroll'

let observeMock: Mock
let disconnectMock: Mock
let triggerIntersect: (isIntersecting: boolean) => void

function setupIntersectionObserverMock() {
  observeMock = vi.fn()
  disconnectMock = vi.fn()

  class MockIntersectionObserver {
    constructor(callback: IntersectionObserverCallback) {
      triggerIntersect = (isIntersecting: boolean) => {
        callback(
          [{ isIntersecting } as IntersectionObserverEntry],
          this as unknown as IntersectionObserver,
        )
      }
    }
    observe = observeMock
    disconnect = disconnectMock
    unobserve = vi.fn()
  }

  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
}

function createSentinelRef(element: HTMLElement | null = document.createElement('div')) {
  return { current: element } as React.RefObject<HTMLElement | null>
}

describe('useInfiniteScroll', () => {
  beforeEach(() => {
    setupIntersectionObserverMock()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('sentinel 要素を observe する', () => {
    const sentinel = document.createElement('div')
    const ref = createSentinelRef(sentinel)
    const onLoadMore = vi.fn()

    renderHook(() =>
      useInfiniteScroll(ref, { hasNextPage: true, loading: false, onLoadMore }),
    )

    expect(observeMock).toHaveBeenCalledWith(sentinel)
  })

  it('交差時に onLoadMore が呼ばれる', () => {
    const ref = createSentinelRef()
    const onLoadMore = vi.fn()

    renderHook(() =>
      useInfiniteScroll(ref, { hasNextPage: true, loading: false, onLoadMore }),
    )

    triggerIntersect(true)
    expect(onLoadMore).toHaveBeenCalledOnce()
  })

  it('loading 中は onLoadMore が呼ばれない', () => {
    const ref = createSentinelRef()
    const onLoadMore = vi.fn()

    renderHook(() =>
      useInfiniteScroll(ref, { hasNextPage: true, loading: true, onLoadMore }),
    )

    triggerIntersect(true)
    expect(onLoadMore).not.toHaveBeenCalled()
  })

  it('交差していなければ onLoadMore が呼ばれない', () => {
    const ref = createSentinelRef()
    const onLoadMore = vi.fn()

    renderHook(() =>
      useInfiniteScroll(ref, { hasNextPage: true, loading: false, onLoadMore }),
    )

    triggerIntersect(false)
    expect(onLoadMore).not.toHaveBeenCalled()
  })

  it('hasNextPage が false なら observe しない', () => {
    const ref = createSentinelRef()
    const onLoadMore = vi.fn()

    renderHook(() =>
      useInfiniteScroll(ref, { hasNextPage: false, loading: false, onLoadMore }),
    )

    expect(observeMock).not.toHaveBeenCalled()
  })

  it('sentinel が null なら observe しない', () => {
    const ref = createSentinelRef(null)
    const onLoadMore = vi.fn()

    renderHook(() =>
      useInfiniteScroll(ref, { hasNextPage: true, loading: false, onLoadMore }),
    )

    expect(observeMock).not.toHaveBeenCalled()
  })

  it('アンマウント時に disconnect が呼ばれる', () => {
    const ref = createSentinelRef()
    const onLoadMore = vi.fn()

    const { unmount } = renderHook(() =>
      useInfiniteScroll(ref, { hasNextPage: true, loading: false, onLoadMore }),
    )

    unmount()
    expect(disconnectMock).toHaveBeenCalledOnce()
  })

  it('hasNextPage が true → false に変わると disconnect される', () => {
    const ref = createSentinelRef()
    const onLoadMore = vi.fn()

    const { rerender } = renderHook(
      (props) => useInfiniteScroll(ref, props),
      { initialProps: { hasNextPage: true, loading: false, onLoadMore } },
    )

    expect(observeMock).toHaveBeenCalledOnce()

    rerender({ hasNextPage: false, loading: false, onLoadMore })
    expect(disconnectMock).toHaveBeenCalled()
  })

  it('loading が途中で解除されると次の交差で onLoadMore が呼ばれる', () => {
    const ref = createSentinelRef()
    const onLoadMore = vi.fn()

    const { rerender } = renderHook(
      (props) => useInfiniteScroll(ref, props),
      { initialProps: { hasNextPage: true, loading: true, onLoadMore } },
    )

    triggerIntersect(true)
    expect(onLoadMore).not.toHaveBeenCalled()

    rerender({ hasNextPage: true, loading: false, onLoadMore })

    triggerIntersect(true)
    expect(onLoadMore).toHaveBeenCalledOnce()
  })

  it('onLoadMore が更新されても最新のコールバックが使われる', () => {
    const ref = createSentinelRef()
    const firstCallback = vi.fn()
    const secondCallback = vi.fn()

    const { rerender } = renderHook(
      (props) => useInfiniteScroll(ref, props),
      { initialProps: { hasNextPage: true, loading: false, onLoadMore: firstCallback } },
    )

    rerender({ hasNextPage: true, loading: false, onLoadMore: secondCallback })

    triggerIntersect(true)
    expect(firstCallback).not.toHaveBeenCalled()
    expect(secondCallback).toHaveBeenCalledOnce()
  })
})
