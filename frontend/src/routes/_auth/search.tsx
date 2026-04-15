import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@apollo/client/react'
import { useUiStore } from '@/lib/stores/uiStore'
import { SearchTweetsDocument, SearchUsersDocument } from '@/lib/graphql/generated/graphql'
import { TweetCard } from '@/components/tweet/TweetCard'
import { UserCard } from '@/components/user/UserCard'
import { TweetCardSkeleton } from '@/components/ui/TweetCardSkeleton'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { EmptyState } from '@/components/ui/EmptyState'
import { InfiniteScrollList } from '@/components/ui/InfiniteScrollList'

export const Route = createFileRoute('/_auth/search')({
  component: SearchPage,
})

const PAGE_SIZE = 20

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

function UserSearchResults({ query }: { query: string }) {
  const { data, loading, error, fetchMore } = useQuery(SearchUsersDocument, {
    variables: { query, first: PAGE_SIZE },
    skip: !query,
    notifyOnNetworkStatusChange: true,
  })

  if (error) return <ErrorMessage message={error.message} onRetry={() => window.location.reload()} />
  if (loading && !data) return <>{Array.from({ length: 3 }).map((_, i) => <TweetCardSkeleton key={i} />)}</>

  const edges = data?.searchUsers?.edges ?? []
  const pageInfo = data?.searchUsers?.pageInfo
  const users = edges.map((e) => e.node)

  return (
    <InfiniteScrollList
      items={users}
      renderItem={(user) => <UserCard key={user.id} user={user} />}
      hasNextPage={pageInfo?.hasNextPage ?? false}
      loading={loading}
      onLoadMore={() =>
        fetchMore({ variables: { after: pageInfo?.endCursor } })
      }
      emptyMessage="ユーザーが見つかりませんでした"
    />
  )
}

function TweetSearchResults({ query }: { query: string }) {
  const { data, loading, error, fetchMore } = useQuery(SearchTweetsDocument, {
    variables: { query, first: PAGE_SIZE },
    skip: !query,
    notifyOnNetworkStatusChange: true,
  })

  if (error) return <ErrorMessage message={error.message} onRetry={() => window.location.reload()} />
  if (loading && !data) return <>{Array.from({ length: 3 }).map((_, i) => <TweetCardSkeleton key={i} />)}</>

  const edges = data?.searchTweets?.edges ?? []
  const pageInfo = data?.searchTweets?.pageInfo
  const tweets = edges.map((e) => e.node)

  return (
    <InfiniteScrollList
      items={tweets}
      renderItem={(tweet) => <TweetCard key={tweet.id} tweet={tweet} />}
      hasNextPage={pageInfo?.hasNextPage ?? false}
      loading={loading}
      onLoadMore={() =>
        fetchMore({ variables: { after: pageInfo?.endCursor } })
      }
      emptyMessage="ツイートが見つかりませんでした"
    />
  )
}

function SearchPage() {
  const [inputValue, setInputValue] = useState('')
  const debouncedQuery = useDebounce(inputValue.trim(), 300)
  const { activeSearchTab, setActiveSearchTab } = useUiStore()

  return (
    <div>
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-divider">
        <div className="px-4 py-2">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-default-400 pointer-events-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx={11} cy={11} r={8} />
              <line x1={21} y1={21} x2={16.65} y2={16.65} />
            </svg>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="キーワードを検索"
              className="w-full rounded-full bg-default-100 py-2 pl-10 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            {inputValue && (
              <button
                type="button"
                onClick={() => setInputValue('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-default-400 hover:text-foreground"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <line x1={18} y1={6} x2={6} y2={18} />
                  <line x1={6} y1={6} x2={18} y2={18} />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="flex">
          <button
            type="button"
            onClick={() => setActiveSearchTab('users')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeSearchTab === 'users'
                ? 'border-primary text-primary'
                : 'border-transparent text-default-500'
            }`}
          >
            ユーザー
          </button>
          <button
            type="button"
            onClick={() => setActiveSearchTab('tweets')}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeSearchTab === 'tweets'
                ? 'border-primary text-primary'
                : 'border-transparent text-default-500'
            }`}
          >
            ツイート
          </button>
        </div>
      </div>

      {!debouncedQuery ? (
        <EmptyState message="キーワードを入力して検索" />
      ) : activeSearchTab === 'users' ? (
        <UserSearchResults query={debouncedQuery} />
      ) : (
        <TweetSearchResults query={debouncedQuery} />
      )}
    </div>
  )
}
