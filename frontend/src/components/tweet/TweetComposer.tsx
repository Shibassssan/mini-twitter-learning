import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { CreateTweetDocument } from '@/lib/graphql/generated/graphql'
import { extractGqlErrorMessage } from '@/lib/utils/graphqlError'

interface TweetComposerProps {
  onSuccess?: () => void
  refetchQueries?: string[]
}

export function TweetComposer({ onSuccess, refetchQueries }: TweetComposerProps) {
  const [content, setContent] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [createTweet, { loading }] = useMutation(CreateTweetDocument, {
    refetchQueries: refetchQueries ?? ['PublicTimeline', 'Timeline'],
    onCompleted: () => {
      setContent('')
      setErrorMsg(null)
      onSuccess?.()
    },
    onError: (err) => {
      setErrorMsg(extractGqlErrorMessage(err, '投稿に失敗しました'))
    },
  })

  const isValid = content.trim().length > 0 && content.length <= 300

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    setErrorMsg(null)
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
      {errorMsg && (
        <p className="text-danger text-xs mt-1">{errorMsg}</p>
      )}
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
