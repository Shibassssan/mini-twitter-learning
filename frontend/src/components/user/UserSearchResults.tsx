import { useQuery } from '@apollo/client/react'
import { useMemo, useCallback } from 'react'
import { SearchUsersDocument } from '@/lib/graphql/generated/graphql'
import { UserCard } from '@/components/user/UserCard'
import { UserCardSkeletonList } from '@/components/ui/UserCardSkeleton'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { InfiniteScrollList } from '@/components/ui/InfiniteScrollList'

const PAGE_SIZE = 20

interface UserSearchResultsProps {
  query: string
}

export function UserSearchResults({ query }: UserSearchResultsProps) {
  const { data, loading, error, fetchMore, refetch } = useQuery(SearchUsersDocument, {
    variables: { query, first: PAGE_SIZE },
    skip: !query,
    notifyOnNetworkStatusChange: true,
  })

  const pageInfo = data?.searchUsers?.pageInfo
  const endCursor = pageInfo?.endCursor

  const users = useMemo(
    () => (data?.searchUsers?.edges ?? []).map((e) => e.node),
    [data],
  )

  const onLoadMore = useCallback(
    () => fetchMore({ variables: { after: endCursor } }),
    [fetchMore, endCursor],
  )

  if (error) return <ErrorMessage message={error.message} onRetry={refetch} />
  if (loading && !data) return <UserCardSkeletonList count={3} />

  return (
    <InfiniteScrollList
      items={users}
      renderItem={(user) => <UserCard key={user.id} user={user} />}
      hasNextPage={pageInfo?.hasNextPage ?? false}
      loading={loading}
      onLoadMore={onLoadMore}
      emptyMessage="ユーザーが見つかりませんでした"
    />
  )
}
