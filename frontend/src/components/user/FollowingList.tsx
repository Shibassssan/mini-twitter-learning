import { useQuery } from '@apollo/client/react'
import { FollowingDocument } from '@/lib/graphql/generated/graphql'
import { UserCard } from '@/components/user/UserCard'
import { UserCardSkeletonList } from '@/components/ui/UserCardSkeleton'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { InfiniteScrollList } from '@/components/ui/InfiniteScrollList'

const PAGE_SIZE = 20

interface FollowingListProps {
  userUuid: string
}

export function FollowingList({ userUuid }: FollowingListProps) {
  const { data, loading, error, fetchMore, refetch } = useQuery(FollowingDocument, {
    variables: { uuid: userUuid, first: PAGE_SIZE },
    notifyOnNetworkStatusChange: true,
  })

  if (error) return <ErrorMessage message={error.message} onRetry={() => refetch()} />
  if (loading && !data) return <UserCardSkeletonList />

  const edges = data?.following?.edges ?? []
  const pageInfo = data?.following?.pageInfo
  const users = edges.map((e) => e.node)

  return (
    <InfiniteScrollList
      items={users}
      renderItem={(user) => <UserCard key={user.id} user={user} />}
      hasNextPage={pageInfo?.hasNextPage ?? false}
      loading={loading}
      onLoadMore={() => fetchMore({ variables: { after: pageInfo?.endCursor } })}
      emptyMessage="フォロー中のユーザーはいません"
    />
  )
}
