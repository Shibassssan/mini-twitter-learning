import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TestApolloProvider } from '@/test/mocks/apollo'
import { UpdateProfileDocument } from '@/lib/graphql/generated/graphql'
import { useProfileEditForm } from '@/lib/hooks/useProfileEditForm'

const user = {
  displayName: 'Taro',
  bio: 'hello',
}

type ProfileEditHookProps = {
  isOpen: boolean
  displayName: string
  bio: string | null
}

describe('useProfileEditForm', () => {
  it('モーダルが開いたときに user の値でフォームを初期化する', () => {
    const { result, rerender } = renderHook(
      ({ isOpen, displayName, bio }: ProfileEditHookProps) =>
        useProfileEditForm({
          user: { displayName, bio },
          isOpen,
          onClose: vi.fn(),
        }),
      {
        initialProps: {
          isOpen: false,
          displayName: user.displayName,
          bio: user.bio,
        },
        wrapper: TestApolloProvider,
      },
    )

    act(() => {
      result.current.setDisplayName('Edited')
      result.current.setBio('edited bio')
    })

    rerender({ isOpen: true, displayName: 'Hanako', bio: '' })

    expect(result.current.displayName).toBe('Hanako')
    expect(result.current.bio).toBe('')
  })

  it('表示名が空白だけなら invalid になる', () => {
    const { result } = renderHook(
      () => useProfileEditForm({ user, isOpen: true, onClose: vi.fn() }),
      { wrapper: TestApolloProvider },
    )

    act(() => {
      result.current.setDisplayName('   ')
    })

    expect(result.current.isValid).toBe(false)
  })

  it('送信時に表示名と自己紹介を trim して保存し、完了後に閉じる', async () => {
    const onClose = vi.fn()
    const mocks = [
      {
        request: {
          query: UpdateProfileDocument,
          variables: { displayName: 'Hanako', bio: null },
        },
        result: {
          data: {
            updateProfile: {
              __typename: 'User' as const,
              id: 'user-1',
              username: 'hanako',
              displayName: 'Hanako',
              bio: null,
              avatarUrl: null,
              followersCount: 0,
              followingCount: 0,
              isFollowedByMe: false,
            },
          },
        },
      },
    ]

    const { result } = renderHook(
      () => useProfileEditForm({ user, isOpen: true, onClose }),
      { wrapper: ({ children }) => <TestApolloProvider mocks={mocks}>{children}</TestApolloProvider> },
    )

    act(() => {
      result.current.setDisplayName('  Hanako  ')
      result.current.setBio('   ')
    })

    act(() => {
      result.current.handleSubmit({ preventDefault: vi.fn() } as unknown as React.FormEvent)
    })

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled()
    })
  })
})
