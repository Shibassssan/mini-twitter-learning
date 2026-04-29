import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TestApolloProvider } from '@/test/mocks/apollo'
import {
  LikeTweetDocument,
  UnlikeTweetDocument,
} from '@/lib/graphql/generated/graphql'
import { useTweetLikeAction } from '@/lib/hooks/useTweetLikeAction'

const baseTweet = {
  id: 'tweet-1',
  likesCount: 1,
  isLikedByMe: false,
}

describe('useTweetLikeAction', () => {
  it('未いいねなら Like mutation を送れる', async () => {
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
    const { result } = renderHook(
      () => useTweetLikeAction({ tweet: baseTweet }),
      { wrapper: ({ children }) => <TestApolloProvider mocks={mocks}>{children}</TestApolloProvider> },
    )

    act(() => {
      result.current.toggleLike()
    })

    await waitFor(() => {
      expect(result.current.isLikeMutating).toBe(false)
    })
  })

  it('いいね済みなら Unlike mutation を送れる', async () => {
    const likedTweet = { ...baseTweet, isLikedByMe: true, likesCount: 2 }
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
              likesCount: 1,
              isLikedByMe: false,
            },
          },
        },
      },
    ]
    const { result } = renderHook(
      () => useTweetLikeAction({ tweet: likedTweet }),
      { wrapper: ({ children }) => <TestApolloProvider mocks={mocks}>{children}</TestApolloProvider> },
    )

    act(() => {
      result.current.toggleLike()
    })

    await waitFor(() => {
      expect(result.current.isLikeMutating).toBe(false)
    })
  })
})
