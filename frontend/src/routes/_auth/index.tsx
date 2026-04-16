import { createFileRoute } from '@tanstack/react-router'
import { Tabs } from '@heroui/react'
import { useUiStore } from '@/lib/stores/uiStore'
import { FollowingTimeline } from '@/components/tweet/FollowingTimeline'
import { GlobalTimeline } from '@/components/tweet/GlobalTimeline'
import { TweetComposer } from '@/components/tweet/TweetComposer'
import { FAB } from '@/components/ui/FAB'

export const Route = createFileRoute('/_auth/')({
  component: HomePage,
})

function HomePage() {
  const { activeTimelineTab, setActiveTimelineTab } = useUiStore()

  return (
    <Tabs
      variant="secondary"
      selectedKey={activeTimelineTab}
      onSelectionChange={(key) => setActiveTimelineTab(key as 'following' | 'global')}
    >
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-divider">
        <h1 className="px-4 py-3 text-xl font-bold max-md:sr-only">ホーム</h1>
        <Tabs.ListContainer>
          <Tabs.List aria-label="タイムライン">
            <Tabs.Tab id="following">フォロー中</Tabs.Tab>
            <Tabs.Tab id="global">全体</Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>
      </div>

      <div className="hidden md:block">
        <TweetComposer />
      </div>

      <Tabs.Panel id="following">
        <FollowingTimeline />
      </Tabs.Panel>
      <Tabs.Panel id="global">
        <GlobalTimeline />
      </Tabs.Panel>

      <FAB />
    </Tabs>
  )
}
