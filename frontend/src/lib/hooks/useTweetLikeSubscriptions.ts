import { useEffect, useMemo, useRef } from 'react'
import { apolloClient } from '@/lib/apollo/client'
import { TweetLikeUpdatedDocument } from '@/lib/graphql/generated/graphql'

const MAX_SUBSCRIBED_TWEETS = 80

/**
 * 表示中ツイートごとにいいね更新を購読し、Apollo Cache を直接更新する。
 * tweetIds が変わっても、増減分だけ subscribe / unsubscribe する。
 */
export function useTweetLikeSubscriptions(tweetIds: readonly string[], enabled: boolean) {
  const subsRef = useRef<Map<string, { unsubscribe: () => void }>>(new Map())
  const idsKey = useMemo(
    () => [...new Set(tweetIds.filter(Boolean))].slice(0, MAX_SUBSCRIBED_TWEETS).sort().join('|'),
    [tweetIds],
  )

  useEffect(() => {
    return () => {
      for (const s of subsRef.current.values()) {
        s.unsubscribe()
      }
      subsRef.current.clear()
    }
  }, [])

  useEffect(() => {
    if (!enabled) {
      for (const s of subsRef.current.values()) {
        s.unsubscribe()
      }
      subsRef.current.clear()
      return
    }

    const desired = new Set(idsKey ? idsKey.split('|').filter(Boolean) : [])

    for (const [id, sub] of [...subsRef.current.entries()]) {
      if (!desired.has(id)) {
        sub.unsubscribe()
        subsRef.current.delete(id)
      }
    }

    for (const tweetId of desired) {
      if (subsRef.current.has(tweetId)) continue

      const apolloSub = apolloClient
        .subscribe({
          query: TweetLikeUpdatedDocument,
          variables: { tweetId },
        })
        .subscribe({
          next: (result) => {
            const t = result.data?.tweetLikeUpdated
            if (!t?.id) return

            const cacheId = apolloClient.cache.identify({
              __typename: 'Tweet',
              id: t.id,
            })
            if (!cacheId) return

            apolloClient.cache.modify({
              id: cacheId,
              fields: {
                likesCount() {
                  return t.likesCount
                },
                isLikedByMe() {
                  return t.isLikedByMe
                },
              },
            })
          },
          error: (err) => {
            console.warn('tweetLikeUpdated subscription error', err)
          },
        })

      subsRef.current.set(tweetId, apolloSub)
    }
  }, [enabled, idsKey])
}
