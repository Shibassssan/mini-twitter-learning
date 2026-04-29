import { Button } from '@heroui/react'

type NewTweetsBannerProps = {
  count: number
  onRefresh: () => void
}

export function NewTweetsBanner({ count, onRefresh }: NewTweetsBannerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sticky top-0 z-20 flex justify-center py-2 px-3 sm:px-4 min-h-[3rem]"
    >
      {count > 0 ? (
        <Button
          size="sm"
          variant="primary"
          onPress={onRefresh}
          className="rounded-full shadow-sm font-semibold"
        >
          {count}件の新しい投稿を表示
        </Button>
      ) : null}
    </div>
  )
}
