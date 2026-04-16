import { memo, useCallback, useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { Avatar, Button } from '@heroui/react'
import { TimeDisplay } from '@/components/ui/TimeDisplay'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import {
  DeleteTweetDocument,
  LikeTweetDocument,
  UnlikeTweetDocument,
} from '@/lib/graphql/generated/graphql'
import { useAuthStore } from '@/lib/stores/authStore'

export interface TweetCardData {
  id: string
  content: string
  createdAt: string
  likesCount: number
  isLikedByMe: boolean
  author: {
    id: string
    username: string
    displayName: string
    avatarUrl?: string | null
  }
}

interface TweetCardProps {
  tweet: TweetCardData
  onDelete?: (id: string) => void
}

export const TweetCard = memo(function TweetCard({ tweet, onDelete }: TweetCardProps) {
  const { user } = useAuthStore()
  const [showConfirm, setShowConfirm] = useState(false)

  const [deleteTweet, { loading }] = useMutation(DeleteTweetDocument, {
    onCompleted: () => {
      onDelete?.(tweet.id)
      setShowConfirm(false)
    },
    update(cache) {
      cache.evict({ id: cache.identify({ __typename: 'Tweet', id: tweet.id }) })
      cache.gc()
    },
  })

  const [likeTweet, { loading: likeLoading }] = useMutation(LikeTweetDocument)
  const [unlikeTweet, { loading: unlikeLoading }] = useMutation(UnlikeTweetDocument)

  const toggleLike = useCallback(() => {
    if (likeLoading || unlikeLoading) return
    if (tweet.isLikedByMe) {
      unlikeTweet({
        variables: { tweetUuid: tweet.id },
        optimisticResponse: {
          unlikeTweet: {
            __typename: 'Tweet',
            id: tweet.id,
            likesCount: Math.max(0, tweet.likesCount - 1),
            isLikedByMe: false,
          },
        },
      })
    } else {
      likeTweet({
        variables: { tweetUuid: tweet.id },
        optimisticResponse: {
          likeTweet: {
            __typename: 'Tweet',
            id: tweet.id,
            likesCount: tweet.likesCount + 1,
            isLikedByMe: true,
          },
        },
      })
    }
  }, [likeLoading, unlikeLoading, tweet, likeTweet, unlikeTweet])

  const isMyTweet = user?.id === tweet.author.id
  const initials = tweet.author.displayName.slice(0, 2).toUpperCase()

  return (
    <>
      <article className="flex gap-2 sm:gap-3 p-3 sm:p-4 border-b border-divider hover:bg-default-50 transition-colors">
        <Avatar size="md" className="shrink-0 scale-90 origin-top-left sm:scale-100">
          <Avatar.Image src={tweet.author.avatarUrl ?? undefined} alt={tweet.author.displayName} />
          <Avatar.Fallback>{initials}</Avatar.Fallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm">{tweet.author.displayName}</span>
            <span className="text-default-400 text-sm">@{tweet.author.username}</span>
            <span className="text-default-400 text-xs">·</span>
            <span className="text-default-400 text-xs">
              <TimeDisplay createdAt={tweet.createdAt} />
            </span>
            {isMyTweet && (
              <Button
                variant="ghost"
                size="sm"
                onPress={() => setShowConfirm(true)}
                className="ml-auto text-default-400 hover:text-danger text-xs"
              >
                削除
              </Button>
            )}
          </div>
          <p className="mt-1 text-sm whitespace-pre-wrap break-words">{tweet.content}</p>
          <Button
            variant="ghost"
            size="sm"
            onPress={toggleLike}
            isDisabled={likeLoading || unlikeLoading}
            aria-label={tweet.isLikedByMe ? 'いいねを取り消す' : 'いいねする'}
            className="mt-2 flex items-center gap-1 text-xs group"
          >
            {tweet.isLikedByMe ? (
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-red-500" aria-hidden="true">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-default-400 stroke-2 group-hover:stroke-red-400 transition-colors" aria-hidden="true">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            )}
            {tweet.likesCount > 0 && (
              <span className={tweet.isLikedByMe ? 'text-red-500' : 'text-default-400 group-hover:text-red-400 transition-colors'}>
                {tweet.likesCount}
              </span>
            )}
          </Button>
        </div>
      </article>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => deleteTweet({ variables: { uuid: tweet.id } })}
        title="ツイートを削除"
        message="このツイートを削除しますか？この操作は取り消せません。"
        confirmLabel="削除"
        isLoading={loading}
      />
    </>
  )
})
