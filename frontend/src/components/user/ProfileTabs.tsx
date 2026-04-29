import { Tabs } from '@heroui/react'
import { useUiStore } from '@/lib/stores/uiStore'
import { UserTweetsList } from '@/components/tweet/UserTweetsList'
import { LikedTweetsList } from '@/components/tweet/LikedTweetsList'

type ProfileTabsProps = {
  userId: string
  isOwnProfile: boolean
}

export function ProfileTabs({ userId, isOwnProfile }: ProfileTabsProps) {
  const { activeProfileTab, setActiveProfileTab } = useUiStore()

  return (
    <Tabs
      variant="secondary"
      selectedKey={activeProfileTab}
      onSelectionChange={(key) => {
        const id = String(key)
        if (id === 'tweets' || id === 'likes') setActiveProfileTab(id)
      }}
      className="mt-2"
    >
      <Tabs.ListContainer>
        <Tabs.List aria-label="プロフィールタブ">
          <Tabs.Tab id="tweets">投稿</Tabs.Tab>
          {isOwnProfile && <Tabs.Tab id="likes">いいね</Tabs.Tab>}
        </Tabs.List>
      </Tabs.ListContainer>
      <Tabs.Panel id="tweets">
        <UserTweetsList userId={userId} />
      </Tabs.Panel>
      {isOwnProfile && (
        <Tabs.Panel id="likes">
          <LikedTweetsList />
        </Tabs.Panel>
      )}
    </Tabs>
  )
}
