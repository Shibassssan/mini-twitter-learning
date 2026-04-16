import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@apollo/client/react'
import { Button, Tabs } from '@heroui/react'
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
    <Tabs
      variant="secondary"
      selectedKey={activeTab}
      onSelectionChange={(key) => handleTabChange(key as Tab)}
    >
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-divider">
        <div className="flex items-center gap-4 px-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            onPress={() => navigate({ to: '/users/$username', params: { username } })}
          >
            ← 戻る
          </Button>
          <div>
            <h1 className="text-lg font-bold">{user.displayName}</h1>
            <p className="text-xs text-default-400">@{username}</p>
          </div>
        </div>
        <Tabs.ListContainer>
          <Tabs.List aria-label="フォロー関係">
            <Tabs.Tab id="followers">フォロワー</Tabs.Tab>
            <Tabs.Tab id="following">フォロー中</Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>
      </div>

      <Tabs.Panel id="followers">
        <FollowersList userUuid={user.id} />
      </Tabs.Panel>
      <Tabs.Panel id="following">
        <FollowingList userUuid={user.id} />
      </Tabs.Panel>
    </Tabs>
  )
}
