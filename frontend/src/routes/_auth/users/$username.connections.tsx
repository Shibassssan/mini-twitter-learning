import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@apollo/client/react'
import { UserByUsernameDocument } from '@/lib/graphql/generated/graphql'
import { FollowersList } from '@/components/user/FollowersList'
import { FollowingList } from '@/components/user/FollowingList'
import { UserCardSkeletonList } from '@/components/ui/UserCardSkeleton'
import { ErrorMessage } from '@/components/ui/ErrorMessage'

type Tab = 'followers' | 'following'

export const Route = createFileRoute('/_auth/users/$username/connections')({
  component: ConnectionsPage,
  validateSearch: (search: Record<string, unknown>): { tab?: Tab } => ({
    tab: search.tab === 'following' ? 'following' : undefined,
  }),
})

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
  if (loading || !data) return <UserCardSkeletonList />

  const user = data.userByUsername

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
            <h1 className="text-lg font-bold">{user.displayName}</h1>
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
        <FollowersList userUuid={user.id} />
      ) : (
        <FollowingList userUuid={user.id} />
      )}
    </div>
  )
}
