import { renderHook, act, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TestApolloProvider } from '@/test/mocks/apollo'
import { UpdateAvatarDocument } from '@/lib/graphql/generated/graphql'
import { useAvatarUpload } from '@/lib/hooks/useAvatarUpload'

function makeChangeEvent(file?: File) {
  return {
    target: {
      files: file ? [file] : [],
      value: 'avatar.png',
    },
  } as unknown as React.ChangeEvent<HTMLInputElement>
}

describe('useAvatarUpload', () => {
  const createObjectURL = vi.fn()
  const revokeObjectURL = vi.fn()

  beforeEach(() => {
    createObjectURL.mockReturnValue('blob:avatar-preview')
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL,
      revokeObjectURL,
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('現在の avatar URL を初期 src として返す', () => {
    const { result } = renderHook(
      () => useAvatarUpload({ currentAvatarUrl: 'https://example.com/avatar.png' }),
      { wrapper: TestApolloProvider },
    )

    expect(result.current.src).toBe('https://example.com/avatar.png')
  })

  it('不正な形式のファイルではエラーを通知してアップロードしない', () => {
    const onValidationError = vi.fn()
    const file = new File(['avatar'], 'avatar.gif', { type: 'image/gif' })
    const { result } = renderHook(
      () => useAvatarUpload({ currentAvatarUrl: null, onValidationError }),
      { wrapper: TestApolloProvider },
    )

    act(() => {
      result.current.handleFileChange(makeChangeEvent(file))
    })

    expect(onValidationError).toHaveBeenCalledWith('JPEG、PNG、WebP形式の画像を選択してください')
    expect(createObjectURL).not.toHaveBeenCalled()
  })

  it('有効なファイルでは preview を作り、アップロード完了後に preview URL を破棄する', async () => {
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })
    const mocks = [
      {
        request: {
          query: UpdateAvatarDocument,
          variables: { avatar: file },
        },
        result: {
          data: {
            updateAvatar: {
              __typename: 'User' as const,
              id: 'user-1',
              avatarUrl: 'https://example.com/new-avatar.png',
            },
          },
        },
      },
    ]
    const { result } = renderHook(
      () => useAvatarUpload({ currentAvatarUrl: null }),
      { wrapper: ({ children }) => <TestApolloProvider mocks={mocks}>{children}</TestApolloProvider> },
    )

    act(() => {
      result.current.handleFileChange(makeChangeEvent(file))
    })

    expect(result.current.src).toBe('blob:avatar-preview')
    expect(createObjectURL).toHaveBeenCalledWith(file)

    await waitFor(() => {
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:avatar-preview')
    })
  })
})
