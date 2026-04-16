import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TweetCard } from '@/components/tweet/TweetCard'
import { TestApolloProvider } from '@/test/mocks/apollo'
import {
  DeleteTweetDocument,
  LikeTweetDocument,
  UnlikeTweetDocument,
} from '@/lib/graphql/generated/graphql'
import { useAuthStore } from '@/lib/stores/authStore'

vi.mock('@/lib/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}))

const baseTweet = {
  id: 'tweet-1',
  content: 'Hello world',
  createdAt: '2025-01-01T00:00:00.000Z',
  likesCount: 1,
  isLikedByMe: false,
  author: {
    id: 'user-b',
    username: 'bob',
    displayName: 'Bob',
    avatarUrl: null as string | null,
  },
}

function mockAuthUser(userId: string) {
  vi.mocked(useAuthStore).mockReturnValue({
    user:
      userId === ''
        ? null
        : { id: userId, username: 'me', displayName: 'Me' },
    accessToken: 'tok',
    isAuthenticated: userId !== '',
    setAuth: vi.fn(),
    clearAuth: vi.fn(),
  } as unknown as ReturnType<typeof useAuthStore>)
}

describe('TweetCard', () => {
  beforeEach(() => {
    mockAuthUser('user-a')
  })

  it('ツイート本文と作者を表示する', () => {
    render(
      <TestApolloProvider>
        <TweetCard tweet={baseTweet} />
      </TestApolloProvider>,
    )
    expect(screen.getByText('Hello world')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('@bob')).toBeInTheDocument()
  })

  it('いいねボタンで Like ミューテーションが送られる', async () => {
    const user = userEvent.setup()
    const mocks = [
      {
        request: {
          query: LikeTweetDocument,
          variables: { tweetUuid: 'tweet-1' },
        },
        result: {
          data: {
            likeTweet: {
              __typename: 'Tweet' as const,
              id: 'tweet-1',
              likesCount: 2,
              isLikedByMe: true,
            },
          },
        },
      },
    ]
    render(
      <TestApolloProvider mocks={mocks}>
        <TweetCard tweet={baseTweet} />
      </TestApolloProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'いいねする' }))
  })

  it('いいね済みのとき Unlike を送れる', async () => {
    const user = userEvent.setup()
    const mocks = [
      {
        request: {
          query: UnlikeTweetDocument,
          variables: { tweetUuid: 'tweet-1' },
        },
        result: {
          data: {
            unlikeTweet: {
              __typename: 'Tweet' as const,
              id: 'tweet-1',
              likesCount: 0,
              isLikedByMe: false,
            },
          },
        },
      },
    ]
    render(
      <TestApolloProvider mocks={mocks}>
        <TweetCard tweet={{ ...baseTweet, isLikedByMe: true, likesCount: 3 }} />
      </TestApolloProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'いいねを取り消す' }))
  })

  it('自分のツイートでは削除ボタンを表示する', () => {
    mockAuthUser('user-b')
    render(
      <TestApolloProvider>
        <TweetCard tweet={baseTweet} />
      </TestApolloProvider>,
    )
    expect(screen.getByRole('button', { name: '削除' })).toBeInTheDocument()
  })

  it('他人のツイートでは削除ボタンを出さない', () => {
    mockAuthUser('user-a')
    render(
      <TestApolloProvider>
        <TweetCard tweet={baseTweet} />
      </TestApolloProvider>,
    )
    expect(screen.queryByRole('button', { name: '削除' })).not.toBeInTheDocument()
  })

  it('削除確認で Delete ミューテーションが送られる', async () => {
    const user = userEvent.setup()
    mockAuthUser('user-b')
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
    render(
      <TestApolloProvider mocks={mocks}>
        <TweetCard tweet={baseTweet} onDelete={onDelete} />
      </TestApolloProvider>,
    )
    await user.click(screen.getByRole('button', { name: '削除' }))
    const deleteButtons = screen.getAllByRole('button', { name: '削除' })
    await user.click(deleteButtons[deleteButtons.length - 1]!)
    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith('tweet-1')
    })
  })
})
