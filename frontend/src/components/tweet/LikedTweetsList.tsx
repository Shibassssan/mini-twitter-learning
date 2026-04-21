import { useQuery } from '@apollo/client/react'
import { useMemo, useCallback } from 'react'
import { LikedTweetsDocument } from '@/lib/graphql/generated/graphql'
import { TweetCard } from '@/components/tweet/TweetCard'
import { TweetCardSkeleton } from '@/components/ui/TweetCardSkeleton'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { InfiniteScrollList } from '@/components/ui/InfiniteScrollList'

const PAGE_SIZE = 20

export function LikedTweetsList() {
  const { data, loading, error, fetchMore, refetch } = useQuery(LikedTweetsDocument, {
    variables: { first: PAGE_SIZE },
    notifyOnNetworkStatusChange: true,
  })

  const pageInfo = data?.likedTweets?.pageInfo
  const endCursor = pageInfo?.endCursor

  const tweets = useMemo(() => (data?.likedTweets?.edges ?? []).map((e) => e.node), [data])

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
      emptyMessage="いいねした投稿はありません"
    />
  )
}
