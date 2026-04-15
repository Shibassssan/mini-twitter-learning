import { useQuery } from '@apollo/client/react'
import { UserTweetsDocument } from '@/lib/graphql/generated/graphql'
import { TweetCard } from '@/components/tweet/TweetCard'
import { TweetCardSkeleton } from '@/components/ui/TweetCardSkeleton'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { InfiniteScrollList } from '@/components/ui/InfiniteScrollList'

const PAGE_SIZE = 20

interface UserTweetsListProps {
  userId: string
}

export function UserTweetsList({ userId }: UserTweetsListProps) {
  const { data, loading, error, fetchMore } = useQuery(UserTweetsDocument, {
    variables: { uuid: userId, first: PAGE_SIZE },
    notifyOnNetworkStatusChange: true,
  })

  if (error) return <ErrorMessage message={error.message} />
  if (loading && !data) {
    return <>{Array.from({ length: 3 }).map((_, i) => <TweetCardSkeleton key={i} />)}</>
  }

  const edges = data?.userTweets?.edges ?? []
  const pageInfo = data?.userTweets?.pageInfo
  const tweets = edges.map((e) => e.node)

  return (
    <InfiniteScrollList
      items={tweets}
      renderItem={(tweet) => <TweetCard key={tweet.id} tweet={tweet} />}
      hasNextPage={pageInfo?.hasNextPage ?? false}
      loading={loading}
      onLoadMore={() => fetchMore({ variables: { after: pageInfo?.endCursor } })}
      emptyMessage="まだツイートはありません"
    />
  )
}
