import { useQuery, useSubscription } from '@apollo/client/react'
import type { TypedDocumentNode } from '@graphql-typed-document-node/core'
import { useMemo, useCallback, useState } from 'react'
import { TweetAddedDocument } from '@/lib/graphql/generated/graphql'
import { useAuthStore } from '@/lib/stores/authStore'
import { useTweetLikeSubscriptions } from '@/lib/hooks/useTweetLikeSubscriptions'
import { TweetCard } from '@/components/tweet/TweetCard'
import { NewTweetsBanner } from '@/components/tweet/NewTweetsBanner'
import { TweetCardSkeleton } from '@/components/ui/TweetCardSkeleton'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { InfiniteScrollList } from '@/components/ui/InfiniteScrollList'

const PAGE_SIZE = 20

type TimelineConnection = {
  edges: Array<{ node: { id: string; [key: string]: unknown } }>
  pageInfo: { hasNextPage: boolean; endCursor?: string | null }
}

type TimelineListProps<TData> = {
  document: TypedDocumentNode<TData, { first?: number; after?: string }>
  dataKey: keyof TData
  emptyMessage: string
  /** フォロー中タイムラインでは新着通知をフォロー関係のみに絞る */
  newTweetFilter?: 'all' | 'following'
}

export function TimelineList<TData>({
  document,
  dataKey,
  emptyMessage,
  newTweetFilter = 'all',
}: TimelineListProps<TData>) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const [pendingNewCount, setPendingNewCount] = useState(0)

  const { data, loading, error, fetchMore, refetch } = useQuery(document, {
    variables: { first: PAGE_SIZE },
    notifyOnNetworkStatusChange: true,
  })

  const connection = data?.[dataKey] as TimelineConnection | undefined
  const pageInfo = connection?.pageInfo
  const endCursor = pageInfo?.endCursor

  const tweets = useMemo(() => (connection?.edges ?? []).map((e) => e.node), [connection])

  useSubscription(TweetAddedDocument, {
    skip: !isAuthenticated,
    onData: ({ data: subData }) => {
      const tweet = subData?.data?.tweetAdded
      if (!tweet) return
      if (newTweetFilter === 'following') {
        const isSelf = tweet.author.id === user?.id
        const fromFollowed = tweet.author.isFollowedByMe
        if (!isSelf && !fromFollowed) return
      }
      setPendingNewCount((c) => c + 1)
    },
  })

  const tweetIds = useMemo(() => tweets.map((t) => t.id), [tweets])
  useTweetLikeSubscriptions(tweetIds, isAuthenticated)

  const onLoadMore = useCallback(
    () => fetchMore({ variables: { after: endCursor ?? undefined } }),
    [fetchMore, endCursor],
  )

  const handleRefreshNew = useCallback(async () => {
    await refetch()
    setPendingNewCount(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [refetch])

  if (error) return <ErrorMessage message={error.message} onRetry={refetch} />
  if (loading && !data)
    return (
      <>
        <TweetCardSkeleton />
        <TweetCardSkeleton />
        <TweetCardSkeleton />
      </>
    )

  return (
    <>
      <NewTweetsBanner count={pendingNewCount} onRefresh={handleRefreshNew} />
      <InfiniteScrollList
        items={tweets}
        renderItem={(tweet) => <TweetCard key={tweet.id} tweet={tweet as any} />}
        hasNextPage={pageInfo?.hasNextPage ?? false}
        loading={loading}
        onLoadMore={onLoadMore}
        emptyMessage={emptyMessage}
      />
    </>
  )
}
