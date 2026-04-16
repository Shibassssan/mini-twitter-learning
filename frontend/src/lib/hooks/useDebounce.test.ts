import { renderHook, act } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { useDebounce } from './useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('初期値をそのまま返す', () => {
    const { result } = renderHook(() => useDebounce('hello', 500))
    expect(result.current).toBe('hello')
  })

  it('delay 経過前は値が更新されない', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 300 } },
    )

    rerender({ value: 'b', delay: 300 })

    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(result.current).toBe('a')
  })

  it('delay 経過後に値が更新される', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 300 } },
    )

    rerender({ value: 'b', delay: 300 })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current).toBe('b')
  })

  it('delay 内に値が再度変わるとタイマーがリセットされる', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 300 } },
    )

    rerender({ value: 'b', delay: 300 })
    act(() => {
      vi.advanceTimersByTime(200)
    })

    rerender({ value: 'c', delay: 300 })
    act(() => {
      vi.advanceTimersByTime(200)
    })

    // b は反映されず、まだ a のまま
    expect(result.current).toBe('a')

    act(() => {
      vi.advanceTimersByTime(100)
    })

    // c の delay 経過後に c が反映
    expect(result.current).toBe('c')
  })

  it('delay が 0 でも非同期に更新される', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'x', delay: 0 } },
    )

    rerender({ value: 'y', delay: 0 })

    expect(result.current).toBe('x')

    act(() => {
      vi.advanceTimersByTime(0)
    })

    expect(result.current).toBe('y')
  })

  it('number 型でも動作する', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 1, delay: 500 } },
    )

    rerender({ value: 42, delay: 500 })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current).toBe(42)
  })
})
