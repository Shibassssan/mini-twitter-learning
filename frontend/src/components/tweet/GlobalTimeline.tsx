import { useQuery } from '@apollo/client/react'
import { useMemo, useCallback } from 'react'
import { PublicTimelineDocument } from '@/lib/graphql/generated/graphql'
import { TweetCard } from '@/components/tweet/TweetCard'
import { TweetCardSkeleton } from '@/components/ui/TweetCardSkeleton'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { InfiniteScrollList } from '@/components/ui/InfiniteScrollList'

const PAGE_SIZE = 20

export function GlobalTimeline() {
  const { data, loading, error, fetchMore, refetch } = useQuery(PublicTimelineDocument, {
    variables: { first: PAGE_SIZE },
    notifyOnNetworkStatusChange: true,
  })

  const pageInfo = data?.publicTimeline?.pageInfo
  const endCursor = pageInfo?.endCursor

  const tweets = useMemo(() => (data?.publicTimeline?.edges ?? []).map((e) => e.node), [data])

  const onLoadMore = useCallback(
    () => fetchMore({ variables: { after: endCursor } }),
    [fetchMore, endCursor],
  )

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
    <InfiniteScrollList
      items={tweets}
      renderItem={(tweet) => <TweetCard key={tweet.id} tweet={tweet} />}
      hasNextPage={pageInfo?.hasNextPage ?? false}
      loading={loading}
      onLoadMore={onLoadMore}
      emptyMessage="まだツイートはありません"
    />
  )
}
