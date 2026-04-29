import { useCallback } from 'react'
import { useMutation } from '@apollo/client/react'
import {
  LikeTweetDocument,
  UnlikeTweetDocument,
} from '@/lib/graphql/generated/graphql'

type TweetLikeTarget = {
  id: string
  likesCount: number
  isLikedByMe: boolean
}

type UseTweetLikeActionOptions = {
  tweet: TweetLikeTarget
}

export function useTweetLikeAction({ tweet }: UseTweetLikeActionOptions) {
  const [likeTweet, { loading: likeLoading }] = useMutation(LikeTweetDocument)
  const [unlikeTweet, { loading: unlikeLoading }] = useMutation(UnlikeTweetDocument)
  const isLikeMutating = likeLoading || unlikeLoading

  const toggleLike = useCallback(() => {
    if (isLikeMutating) return

    if (tweet.isLikedByMe) {
      unlikeTweet({
        variables: { tweetUuid: tweet.id },
        // Keep the action bar responsive by reflecting the new like state before the server replies.
        optimisticResponse: {
          unlikeTweet: {
            __typename: 'Tweet',
            id: tweet.id,
            likesCount: Math.max(0, tweet.likesCount - 1),
            isLikedByMe: false,
          },
        },
      })
      return
    }

    likeTweet({
      variables: { tweetUuid: tweet.id },
      // Keep the action bar responsive by reflecting the new like state before the server replies.
      optimisticResponse: {
        likeTweet: {
          __typename: 'Tweet',
          id: tweet.id,
          likesCount: tweet.likesCount + 1,
          isLikedByMe: true,
        },
      },
    })
  }, [isLikeMutating, likeTweet, tweet, unlikeTweet])

  return {
    toggleLike,
    isLikeMutating,
  }
}
