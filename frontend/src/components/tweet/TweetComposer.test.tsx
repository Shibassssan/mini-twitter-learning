import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TweetComposer } from '@/components/tweet/TweetComposer'
import { TestApolloProvider } from '@/test/mocks/apollo'
import { CreateTweetDocument } from '@/lib/graphql/generated/graphql'

describe('TweetComposer', () => {
  it('空では送信できない', () => {
    render(
      <TestApolloProvider>
        <TweetComposer />
      </TestApolloProvider>,
    )
    expect(screen.getByRole('button', { name: /ツイート/ })).toBeDisabled()
  })

  it('文字数カウンターと投稿成功でクリア', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    const mocks = [
      {
        request: {
          query: CreateTweetDocument,
          variables: { content: 'hello' },
        },
        result: {
          data: {
            createTweet: {
              __typename: 'Tweet' as const,
              id: 'new-1',
              content: 'hello',
              createdAt: '2025-01-01T00:00:00.000Z',
              likesCount: 0,
              isLikedByMe: false,
              author: {
                __typename: 'User' as const,
                id: 'u1',
                username: 'me',
                displayName: 'Me',
              },
            },
          },
        },
      },
    ]
    render(
      <TestApolloProvider mocks={mocks}>
        <TweetComposer onSuccess={onSuccess} refetchQueries={[]} />
      </TestApolloProvider>,
    )
    const area = screen.getByPlaceholderText('いまどうしてる？')
    await user.type(area, 'hello')
    expect(screen.getByText('5/300')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /ツイート/ }))
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(area).toHaveValue('')
    })
  })

  it('エラー時はメッセージを表示', async () => {
    const user = userEvent.setup()
    const mocks = [
      {
        request: {
          query: CreateTweetDocument,
          variables: { content: 'x' },
        },
        result: {
          errors: [{ message: '投稿に失敗' }],
        },
      },
    ]
    render(
      <TestApolloProvider mocks={mocks}>
        <TweetComposer refetchQueries={[]} />
      </TestApolloProvider>,
    )
    await user.type(screen.getByPlaceholderText('いまどうしてる？'), 'x')
    await user.click(screen.getByRole('button', { name: /ツイート/ }))
    expect(await screen.findByText(/投稿に失敗|失敗しました/)).toBeInTheDocument()
  })
})
