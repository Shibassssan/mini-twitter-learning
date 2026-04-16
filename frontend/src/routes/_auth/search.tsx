import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Button, Input, Tabs } from '@heroui/react'
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
  const debouncedQuery = useDebounce(inputValue.trim(), 300)
  const { activeSearchTab, setActiveSearchTab } = useUiStore()

  return (
    <Tabs
      variant="secondary"
      selectedKey={activeSearchTab}
      onSelectionChange={(key) => setActiveSearchTab(key as 'users' | 'tweets')}
    >
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-divider">
        <div className="px-4 py-2">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-default-400 pointer-events-none z-10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              role="img"
              aria-label="検索"
            >
              <title>検索</title>
              <circle cx={11} cy={11} r={8} />
              <line x1={21} y1={21} x2={16.65} y2={16.65} />
            </svg>
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="キーワードを検索"
              fullWidth
              className="[&_input]:rounded-full [&_input]:pl-10 [&_input]:pr-10"
            />
            {inputValue && (
              <Button
                variant="ghost"
                isIconOnly
                size="sm"
                aria-label="検索キーワードを消去"
                onPress={() => setInputValue('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-default-400 hover:text-foreground"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  role="img"
                  aria-hidden
                >
                  <title>消去</title>
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
        ) : (
          <UserSearchResults query={debouncedQuery} />
        )}
      </Tabs.Panel>
      <Tabs.Panel id="tweets">
        {!debouncedQuery ? (
          <EmptyState message="キーワードを入力して検索" />
        ) : (
          <TweetSearchResults query={debouncedQuery} />
        )}
      </Tabs.Panel>
    </Tabs>
  )
}
