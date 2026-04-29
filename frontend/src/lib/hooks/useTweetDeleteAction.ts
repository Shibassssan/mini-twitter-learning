import { useCallback, useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { DeleteTweetDocument } from '@/lib/graphql/generated/graphql'

type TweetDeleteTarget = {
  id: string
}

type UseTweetDeleteActionOptions = {
  tweet: TweetDeleteTarget
  onDelete?: (id: string) => void
}

export function useTweetDeleteAction({ tweet, onDelete }: UseTweetDeleteActionOptions) {
  const [showConfirm, setShowConfirm] = useState(false)

  const [deleteTweet, { loading: isDeleting }] = useMutation(DeleteTweetDocument, {
    onCompleted: () => {
      onDelete?.(tweet.id)
      setShowConfirm(false)
    },
    update(cache) {
      // Remove the deleted tweet from all cached timelines without waiting for a full refetch.
      cache.evict({ id: cache.identify({ __typename: 'Tweet', id: tweet.id }) })
      cache.gc()
    },
  })

  const openDeleteConfirm = useCallback(() => {
    setShowConfirm(true)
  }, [])

  const closeDeleteConfirm = useCallback(() => {
    setShowConfirm(false)
  }, [])

  const confirmDelete = useCallback(() => {
    deleteTweet({ variables: { uuid: tweet.id } })
  }, [deleteTweet, tweet.id])

  return {
    showConfirm,
    openDeleteConfirm,
    closeDeleteConfirm,
    confirmDelete,
    isDeleting,
  }
}
