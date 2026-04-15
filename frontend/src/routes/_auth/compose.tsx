import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { TweetComposer } from '@/components/tweet/TweetComposer'

export const Route = createFileRoute('/_auth/compose')({
  component: ComposePage,
})

function ComposePage() {
  const navigate = useNavigate()

  return (
    <div className="p-4">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => navigate({ to: '/' })}
          className="text-default-500 hover:text-foreground"
        >
          ← 戻る
        </button>
        <h1 className="text-lg font-bold">ツイート作成</h1>
      </div>
      <TweetComposer onSuccess={() => navigate({ to: '/' })} />
    </div>
  )
}
