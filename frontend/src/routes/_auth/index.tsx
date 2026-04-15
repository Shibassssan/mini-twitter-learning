import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@apollo/client/react'
import { useUiStore } from '@/lib/stores/uiStore'
import { TIMELINE_QUERY, PUBLIC_TIMELINE_QUERY } from '@/lib/graphql/operations/tweet'
import { TweetCard } from '@/components/tweet/TweetCard'
import { TweetComposer } from '@/components/tweet/TweetComposer'
import { TweetCardSkeleton } from '@/components/ui/TweetCardSkeleton'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { InfiniteScrollList } from '@/components/ui/InfiniteScrollList'
import { FAB } from '@/components/ui/FAB'
import type { TweetNode } from '@/lib/graphql/types'

export const Route = createFileRoute('/_auth/')({
  component: HomePage,
})

const PAGE_SIZE = 20

function FollowingTimeline() {
  const { data, loading, error, fetchMore } = useQuery(TIMELINE_QUERY, {
    variables: { scope: 'FOLLOWING', first: PAGE_SIZE },
    notifyOnNetworkStatusChange: true,
  })

  if (error) return <ErrorMessage message={error.message} onRetry={() => window.location.reload()} />
  if (loading && !data) return <>{Array.from({ length: 3 }).map((_, i) => <TweetCardSkeleton key={i} />)}</>

  const edges = data?.timeline?.edges ?? []
  const pageInfo = data?.timeline?.pageInfo
  const tweets: TweetNode[] = edges.map((e) => e.node)

  return (
    <InfiniteScrollList
      items={tweets}
      renderItem={(tweet) => <TweetCard key={tweet.id} tweet={tweet} />}
      hasNextPage={pageInfo?.hasNextPage ?? false}
      loading={loading}
      onLoadMore={() =>
        fetchMore({ variables: { after: pageInfo?.endCursor } })
      }
      emptyMessage="フォロー中のユーザーのツイートはありません"
    />
  )
}

function GlobalTimeline() {
  const { data, loading, error, fetchMore } = useQuery(PUBLIC_TIMELINE_QUERY, {
    variables: { first: PAGE_SIZE },
    notifyOnNetworkStatusChange: true,
  })

  if (error) return <ErrorMessage message={error.message} onRetry={() => window.location.reload()} />
  if (loading && !data) return <>{Array.from({ length: 3 }).map((_, i) => <TweetCardSkeleton key={i} />)}</>

  const edges = data?.publicTimeline?.edges ?? []
  const pageInfo = data?.publicTimeline?.pageInfo
  const tweets: TweetNode[] = edges.map((e) => e.node)

  return (
    <InfiniteScrollList
      items={tweets}
      renderItem={(tweet) => <TweetCard key={tweet.id} tweet={tweet} />}
      hasNextPage={pageInfo?.hasNextPage ?? false}
      loading={loading}
      onLoadMore={() =>
        fetchMore({ variables: { after: pageInfo?.endCursor } })
      }
      emptyMessage="まだツイートはありません"
    />
  )
}

function HomePage() {
  const { activeTimelineTab, setActiveTimelineTab } = useUiStore()

  return (
    <div>
      {/* ヘッダー */}
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

      {/* デスクトップ: インラインTweetComposer */}
      <div className="hidden md:block">
        <TweetComposer />
      </div>

      {/* タイムライン */}
      {activeTimelineTab === 'following' ? <FollowingTimeline /> : <GlobalTimeline />}

      {/* モバイル: FAB */}
      <FAB />
    </div>
  )
}
