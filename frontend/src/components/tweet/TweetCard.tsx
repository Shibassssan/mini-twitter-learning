import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { TimeDisplay } from '@/components/ui/TimeDisplay'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { DELETE_TWEET_MUTATION } from '@/lib/graphql/operations/tweet'
import { useAuthStore } from '@/lib/stores/authStore'
import type { TweetNode } from '@/lib/graphql/types'

interface TweetCardProps {
  tweet: TweetNode
  onDelete?: (id: string) => void
}

export function TweetCard({ tweet, onDelete }: TweetCardProps) {
  const { user } = useAuthStore()
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleteTweet, { loading }] = useMutation(DELETE_TWEET_MUTATION, {
    onCompleted: () => {
      onDelete?.(tweet.id)
      setShowConfirm(false)
    },
  })

  const isMyTweet = user?.id === tweet.author.id
  const initials = tweet.author.displayName.slice(0, 2).toUpperCase()

  return (
    <>
      <article className="flex gap-3 p-4 border-b border-divider hover:bg-default-50 transition-colors">
        {/* アバター */}
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          {/* ヘッダー */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm">{tweet.author.displayName}</span>
            <span className="text-default-400 text-sm">@{tweet.author.username}</span>
            <span className="text-default-400 text-xs">·</span>
            <span className="text-default-400 text-xs">
              <TimeDisplay createdAt={tweet.createdAt} />
            </span>
            {isMyTweet && (
              <button
                onClick={() => setShowConfirm(true)}
                className="ml-auto text-default-400 hover:text-danger text-xs"
              >
                削除
              </button>
            )}
          </div>
          {/* 本文 */}
          <p className="mt-1 text-sm whitespace-pre-wrap break-words">{tweet.content}</p>
          {/* いいねカウント（表示のみ、Phase 3で操作を追加） */}
          <div className="mt-2 text-default-400 text-xs">♡ {tweet.likesCount}</div>
        </div>
      </article>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => deleteTweet({ variables: { id: tweet.id } })}
        title="ツイートを削除"
        message="このツイートを削除しますか？この操作は取り消せません。"
        confirmLabel="削除"
        isLoading={loading}
      />
    </>
  )
}
