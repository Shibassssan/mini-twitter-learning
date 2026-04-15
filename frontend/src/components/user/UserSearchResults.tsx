import { useQuery } from '@apollo/client/react'
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
  const { data, loading, error, fetchMore } = useQuery(SearchUsersDocument, {
    variables: { query, first: PAGE_SIZE },
    skip: !query,
    notifyOnNetworkStatusChange: true,
  })

  if (error) return <ErrorMessage message={error.message} onRetry={() => window.location.reload()} />
  if (loading && !data) return <UserCardSkeletonList count={3} />

  const edges = data?.searchUsers?.edges ?? []
  const pageInfo = data?.searchUsers?.pageInfo
  const users = edges.map((e) => e.node)

  return (
    <InfiniteScrollList
      items={users}
      renderItem={(user) => <UserCard key={user.id} user={user} />}
      hasNextPage={pageInfo?.hasNextPage ?? false}
      loading={loading}
      onLoadMore={() => fetchMore({ variables: { after: pageInfo?.endCursor } })}
      emptyMessage="ユーザーが見つかりませんでした"
    />
  )
}
