import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FollowButton } from '@/components/user/FollowButton'
import { TestApolloProvider } from '@/test/mocks/apollo'
import {
  FollowersDocument,
  FollowingDocument,
  FollowUserDocument,
  UnfollowUserDocument,
} from '@/lib/graphql/generated/graphql'
import { useAuthStore } from '@/lib/stores/authStore'

vi.mock('@/lib/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}))

const baseProps = {
  userId: 'user-target',
  username: 'target',
  displayName: 'Target User',
  followersCount: 10,
  followingCount: 5,
}

const connectionRefetchMocks = [
  {
    request: {
      query: FollowersDocument,
      variables: { uuid: 'user-target', first: 20 },
    },
    result: {
      data: {
        followers: {
          __typename: 'UserConnection' as const,
          edges: [],
          pageInfo: {
            __typename: 'PageInfo' as const,
            hasNextPage: false,
            endCursor: null,
          },
        },
      },
    },
  },
  {
    request: {
      query: FollowingDocument,
      variables: { uuid: 'user-self', first: 20 },
    },
    result: {
      data: {
        following: {
          __typename: 'UserConnection' as const,
          edges: [],
          pageInfo: {
            __typename: 'PageInfo' as const,
            hasNextPage: false,
            endCursor: null,
          },
        },
      },
    },
  },
]

function mockAuthUser(userId: string | null) {
  vi.mocked(useAuthStore).mockReturnValue({
    user: userId ? { id: userId, username: 'me', displayName: 'Me' } : null,
    accessToken: userId ? 'tok' : null,
    isAuthenticated: Boolean(userId),
    setAuth: vi.fn(),
    clearAuth: vi.fn(),
  } as unknown as ReturnType<typeof useAuthStore>)
}

describe('FollowButton', () => {
  beforeEach(() => {
    mockAuthUser('user-self')
  })

  it('未フォロー時はフォローするを表示しミューテーションする', async () => {
    const user = userEvent.setup()
    const mocks = [
      {
        request: {
          query: FollowUserDocument,
          variables: { userUuid: 'user-target' },
        },
        result: {
          data: {
            followUser: {
              __typename: 'User' as const,
              id: 'user-target',
              username: 'target',
              displayName: 'Target User',
              isFollowedByMe: true,
              followersCount: 11,
              followingCount: 5,
            },
          },
        },
      },
      ...connectionRefetchMocks,
    ]
    render(
      <TestApolloProvider mocks={mocks}>
        <FollowButton {...baseProps} isFollowedByMe={false} />
      </TestApolloProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'フォローする' }))
  })

  it('フォロー中はフォロー解除できる', async () => {
    const user = userEvent.setup()
    const mocks = [
      {
        request: {
          query: UnfollowUserDocument,
          variables: { userUuid: 'user-target' },
        },
        result: {
          data: {
            unfollowUser: {
              __typename: 'User' as const,
              id: 'user-target',
              username: 'target',
              displayName: 'Target User',
              isFollowedByMe: false,
              followersCount: 9,
              followingCount: 5,
            },
          },
        },
      },
      ...connectionRefetchMocks,
    ]
    render(
      <TestApolloProvider mocks={mocks}>
        <FollowButton {...baseProps} isFollowedByMe />
      </TestApolloProvider>,
    )
    await user.click(screen.getByRole('button', { name: 'フォロー解除' }))
  })

  it('自分自身にはボタンを出さない', () => {
    mockAuthUser('user-target')
    render(
      <TestApolloProvider>
        <FollowButton {...baseProps} isFollowedByMe={false} />
      </TestApolloProvider>,
    )
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
