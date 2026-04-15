import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@apollo/client/react'
import {
  UserByUsernameDocument,
  FollowersDocument,
  FollowingDocument,
} from '@/lib/graphql/generated/graphql'
import { UserCard } from '@/components/user/UserCard'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { InfiniteScrollList } from '@/components/ui/InfiniteScrollList'

type Tab = 'followers' | 'following'

const PAGE_SIZE = 20

export const Route = createFileRoute('/_auth/users/$username/connections')({
  component: ConnectionsPage,
  validateSearch: (search: Record<string, unknown>): { tab?: Tab } => ({
    tab: search.tab === 'following' ? 'following' : undefined,
  }),
})

function UserCardSkeleton() {
  return (
    <div className="flex gap-3 p-4 border-b border-divider animate-pulse">
      <div className="w-10 h-10 rounded-full bg-default-200 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-default-200 rounded w-24" />
        <div className="h-3 bg-default-200 rounded w-16" />
      </div>
    </div>
  )
}

function SkeletonList() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <UserCardSkeleton key={i} />
      ))}
    </>
  )
}

function FollowersList({ userUuid }: { userUuid: string }) {
  const { data, loading, error, fetchMore, refetch } = useQuery(FollowersDocument, {
    variables: { uuid: userUuid, first: PAGE_SIZE },
    notifyOnNetworkStatusChange: true,
  })

  if (error) return <ErrorMessage message={error.message} onRetry={() => refetch()} />
  if (loading && !data) return <SkeletonList />

  const edges = data?.followers?.edges ?? []
  const pageInfo = data?.followers?.pageInfo
  const users = edges.map((e) => e.node)

  return (
    <InfiniteScrollList
      items={users}
      renderItem={(user) => <UserCard key={user.id} user={user} />}
      hasNextPage={pageInfo?.hasNextPage ?? false}
      loading={loading}
      onLoadMore={() => fetchMore({ variables: { after: pageInfo?.endCursor } })}
      emptyMessage="フォロワーはまだいません"
    />
  )
}

function FollowingList({ userUuid }: { userUuid: string }) {
  const { data, loading, error, fetchMore, refetch } = useQuery(FollowingDocument, {
    variables: { uuid: userUuid, first: PAGE_SIZE },
    notifyOnNetworkStatusChange: true,
  })

  if (error) return <ErrorMessage message={error.message} onRetry={() => refetch()} />
  if (loading && !data) return <SkeletonList />

  const edges = data?.following?.edges ?? []
  const pageInfo = data?.following?.pageInfo
  const users = edges.map((e) => e.node)

  return (
    <InfiniteScrollList
      items={users}
      renderItem={(user) => <UserCard key={user.id} user={user} />}
      hasNextPage={pageInfo?.hasNextPage ?? false}
      loading={loading}
      onLoadMore={() => fetchMore({ variables: { after: pageInfo?.endCursor } })}
      emptyMessage="フォロー中のユーザーはいません"
    />
  )
}

function ConnectionsPage() {
  const { username } = Route.useParams()
  const { tab: searchTab } = Route.useSearch()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>(searchTab === 'following' ? 'following' : 'followers')

  const { data, loading, error, refetch } = useQuery(UserByUsernameDocument, {
    variables: { username },
  })

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab)
    navigate({
      to: '/users/$username/connections',
      params: { username },
      search: tab === 'following' ? { tab: 'following' } : {},
      replace: true,
    })
  }

  if (error) return <ErrorMessage message={error.message} onRetry={() => refetch()} />
  if (loading || !data) return <SkeletonList />

  const userUuid = data.userByUsername.id

  return (
    <div>
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-divider">
        <div className="flex items-center gap-4 px-4 py-2">
          <button
            type="button"
            onClick={() => navigate({ to: '/users/$username', params: { username } })}
            className="text-default-500 hover:text-foreground"
          >
            ← 戻る
          </button>
          <div>
            <h1 className="text-lg font-bold">{data.userByUsername.displayName}</h1>
            <p className="text-xs text-default-400">@{username}</p>
          </div>
        </div>
        <div className="flex">
          <button
            type="button"
            onClick={() => handleTabChange('followers')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'followers'
                ? 'border-primary text-primary'
                : 'border-transparent text-default-500'
            }`}
          >
            フォロワー
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('following')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'following'
                ? 'border-primary text-primary'
                : 'border-transparent text-default-500'
            }`}
          >
            フォロー中
          </button>
        </div>
      </div>

      {activeTab === 'followers' ? (
        <FollowersList userUuid={userUuid} />
      ) : (
        <FollowingList userUuid={userUuid} />
      )}
    </div>
  )
}
