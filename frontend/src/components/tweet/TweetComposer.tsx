import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { CREATE_TWEET_MUTATION } from '@/lib/graphql/operations/tweet'

interface TweetComposerProps {
  onSuccess?: () => void
  refetchQueries?: string[]
}

export function TweetComposer({ onSuccess, refetchQueries }: TweetComposerProps) {
  const [content, setContent] = useState('')
  const [createTweet, { loading }] = useMutation(CREATE_TWEET_MUTATION, {
    refetchQueries: refetchQueries ?? ['PublicTimeline', 'Timeline'],
    onCompleted: () => {
      setContent('')
      onSuccess?.()
    },
  })

  const isValid = content.trim().length > 0 && content.length <= 300

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    createTweet({ variables: { content } })
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border-b border-divider">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="いまどうしてる？"
        rows={3}
        maxLength={300}
        className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-default-400"
      />
      <div className="flex items-center justify-between mt-2">
        <span className={`text-xs ${content.length > 280 ? 'text-danger' : 'text-default-400'}`}>
          {content.length}/300
        </span>
        <button
          type="submit"
          disabled={!isValid || loading}
          className="bg-primary text-white text-sm px-4 py-1.5 rounded-full disabled:opacity-50"
        >
          {loading ? '投稿中...' : 'ツイート'}
        </button>
      </div>
    </form>
  )
}
