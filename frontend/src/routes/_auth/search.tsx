import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Button, Tabs } from '@heroui/react'
import { useUiStore } from '@/lib/stores/uiStore'
import { useDebounce } from '@/lib/hooks/useDebounce'
import { UserSearchResults } from '@/components/user/UserSearchResults'
import { TweetSearchResults } from '@/components/tweet/TweetSearchResults'
import { EmptyState } from '@/components/ui/EmptyState'

export const Route = createFileRoute('/_auth/search')({
  component: SearchPage,
})

function SearchPage() {
  const [inputValue, setInputValue] = useState('')
  const trimmed = inputValue.trim()
  const debouncedQuery = useDebounce(trimmed, 300)
  const canSearch = debouncedQuery.length >= 3
  const { activeSearchTab, setActiveSearchTab } = useUiStore()

  return (
    <Tabs
      variant="secondary"
      selectedKey={activeSearchTab}
      onSelectionChange={(key) => setActiveSearchTab(key as 'users' | 'tweets')}
    >
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-divider">
        <div className="px-3 sm:px-4 py-2">
          <div className="relative flex items-center">
            <svg
              className="absolute left-3 w-4 h-4 text-default-400 pointer-events-none shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx={11} cy={11} r={8} />
              <line x1={21} y1={21} x2={16.65} y2={16.65} />
            </svg>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="キーワードを検索（3文字以上）"
              aria-label="キーワードを検索"
              className="w-full rounded-full border border-divider bg-default-100 py-2 pl-9 pr-9 text-sm outline-none placeholder:text-default-400 focus:border-primary focus:bg-background transition-colors"
            />
            {inputValue && (
              <Button
                variant="ghost"
                isIconOnly
                size="sm"
                aria-label="検索キーワードを消去"
                onPress={() => setInputValue('')}
                className="absolute right-1 text-default-400 hover:text-foreground"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1={18} y1={6} x2={6} y2={18} />
                  <line x1={6} y1={6} x2={18} y2={18} />
                </svg>
              </Button>
            )}
          </div>
        </div>

        <Tabs.ListContainer>
          <Tabs.List aria-label="検索カテゴリ">
            <Tabs.Tab id="users">ユーザー</Tabs.Tab>
            <Tabs.Tab id="tweets">ツイート</Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>
      </div>

      <Tabs.Panel id="users">
        {!debouncedQuery ? (
          <EmptyState message="キーワードを入力して検索" />
        ) : !canSearch ? (
          <EmptyState message="検索は3文字以上入力してください" />
        ) : (
          <UserSearchResults query={debouncedQuery} />
        )}
      </Tabs.Panel>
      <Tabs.Panel id="tweets">
        {!debouncedQuery ? (
          <EmptyState message="キーワードを入力して検索" />
        ) : !canSearch ? (
          <EmptyState message="検索は3文字以上入力してください" />
        ) : (
          <TweetSearchResults query={debouncedQuery} />
        )}
      </Tabs.Panel>
    </Tabs>
  )
}
