import { createFileRoute } from '@tanstack/react-router'
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
    <div>
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-divider">
        <h1 className="px-4 py-3 text-xl font-bold hidden md:block">ホーム</h1>
        <div className="flex">
          <button
            onClick={() => setActiveTimelineTab('following')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTimelineTab === 'following'
                ? 'border-primary text-primary'
                : 'border-transparent text-default-500'
            }`}
          >
            フォロー中
          </button>
          <button
            onClick={() => setActiveTimelineTab('global')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTimelineTab === 'global'
                ? 'border-primary text-primary'
                : 'border-transparent text-default-500'
            }`}
          >
            全体
          </button>
        </div>
      </div>

      <div className="hidden md:block">
        <TweetComposer />
      </div>

      {activeTimelineTab === 'following' ? <FollowingTimeline /> : <GlobalTimeline />}

      <FAB />
    </div>
  )
}
