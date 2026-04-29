import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TestApolloProvider } from '@/test/mocks/apollo'
import { DeleteTweetDocument } from '@/lib/graphql/generated/graphql'
import { useTweetDeleteAction } from '@/lib/hooks/useTweetDeleteAction'

const tweet = {
  id: 'tweet-1',
}

describe('useTweetDeleteAction', () => {
  it('削除確認ダイアログの開閉状態を管理する', () => {
    const { result } = renderHook(
      () => useTweetDeleteAction({ tweet }),
      { wrapper: TestApolloProvider },
    )

    act(() => {
      result.current.openDeleteConfirm()
    })
    expect(result.current.showConfirm).toBe(true)

    act(() => {
      result.current.closeDeleteConfirm()
    })
    expect(result.current.showConfirm).toBe(false)
  })

  it('削除完了後に onDelete を呼び、確認ダイアログを閉じる', async () => {
    const onDelete = vi.fn()
    const mocks = [
      {
        request: {
          query: DeleteTweetDocument,
          variables: { uuid: 'tweet-1' },
        },
        result: { data: { deleteTweet: true } },
      },
    ]
    const { result } = renderHook(
      () => useTweetDeleteAction({ tweet, onDelete }),
      { wrapper: ({ children }) => <TestApolloProvider mocks={mocks}>{children}</TestApolloProvider> },
    )

    act(() => {
      result.current.openDeleteConfirm()
      result.current.confirmDelete()
    })

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith('tweet-1')
    })
    expect(result.current.showConfirm).toBe(false)
  })
})
