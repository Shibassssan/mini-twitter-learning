import { useMemo, useCallback } from 'react'
import { useQuery } from '@apollo/client/react'
import { FollowersDocument } from '@/lib/graphql/generated/graphql'
import { UserCard } from '@/components/user/UserCard'
import { UserCardSkeletonList } from '@/components/ui/UserCardSkeleton'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { InfiniteScrollList } from '@/components/ui/InfiniteScrollList'

const PAGE_SIZE = 20

interface FollowersListProps {
  userUuid: string
}

export function FollowersList({ userUuid }: FollowersListProps) {
  const { data, loading, error, fetchMore, refetch } = useQuery(FollowersDocument, {
    variables: { uuid: userUuid, first: PAGE_SIZE },
    notifyOnNetworkStatusChange: true,
  })

  const pageInfo = data?.followers?.pageInfo
  const endCursor = pageInfo?.endCursor
  const users = useMemo(
    () => data?.followers?.edges?.map((e) => e.node) ?? [],
    [data],
  )
  const onLoadMore = useCallback(
    () => fetchMore({ variables: { after: endCursor } }),
    [fetchMore, endCursor],
  )

  if (error) return <ErrorMessage message={error.message} onRetry={() => refetch()} />
  if (loading && !data) return <UserCardSkeletonList />

  return (
    <InfiniteScrollList
      items={users}
      renderItem={(user) => <UserCard key={user.id} user={user} />}
      hasNextPage={pageInfo?.hasNextPage ?? false}
      loading={loading}
      onLoadMore={onLoadMore}
      emptyMessage="フォロワーはまだいません"
    />
  )
}
