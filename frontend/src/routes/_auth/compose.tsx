import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@heroui/react'
import { TweetComposer } from '@/components/tweet/TweetComposer'

export const Route = createFileRoute('/_auth/compose')({
  component: ComposePage,
})

function ComposePage() {
  const navigate = useNavigate()

  return (
    <div className="p-4">
      <div className="flex items-center gap-4 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onPress={() => navigate({ to: '/' })}
        >
          ← 戻る
        </Button>
        <h1 className="text-lg font-bold">投稿を作成</h1>
      </div>
      <TweetComposer onSuccess={() => navigate({ to: '/' })} />
    </div>
  )
}
