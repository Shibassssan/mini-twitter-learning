import { useMutation } from '@apollo/client/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, TextArea, Spinner } from '@heroui/react'
import { CreateTweetDocument } from '@/lib/graphql/generated/graphql'
import { extractGqlErrorMessage } from '@/lib/utils/graphqlError'
import { tweetSchema, type TweetFormValues } from '@/lib/validations/tweet'

interface TweetComposerProps {
  onSuccess?: () => void
  refetchQueries?: string[]
}

export function TweetComposer({ onSuccess, refetchQueries }: TweetComposerProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    formState: { errors, isValid },
  } = useForm<TweetFormValues>({
    resolver: zodResolver(tweetSchema),
    mode: 'onChange',
    defaultValues: { content: '' },
  })

  const [createTweet, { loading }] = useMutation(CreateTweetDocument, {
    refetchQueries: refetchQueries ?? [],
    onCompleted: () => {
      reset()
      onSuccess?.()
    },
    onError: (err) => {
      setError('root', { message: extractGqlErrorMessage(err, '投稿に失敗しました') })
    },
  })

  const content = watch('content')

  const onSubmit = (data: TweetFormValues) => {
    createTweet({ variables: { content: data.content } })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-3 sm:p-4 border-b border-divider">
      <TextArea
        fullWidth
        {...register('content')}
        aria-label="ツイート内容"
        aria-invalid={errors.content ? true : undefined}
        aria-describedby={errors.content ? 'tweet-content-error' : undefined}
        placeholder="いまどうしてる？"
        rows={3}
        maxLength={300}
        style={{ resize: 'none' }}
        className={errors.content ? 'border-danger' : undefined}
      />
      {errors.content?.message && (
        <p id="tweet-content-error" role="alert" className="text-danger text-xs mt-1">
          {errors.content.message}
        </p>
      )}
      {errors.root?.message && (
        <p role="alert" className="text-danger text-xs mt-1">
          {errors.root.message}
        </p>
      )}
      <div className="flex items-center justify-between mt-2">
        <span className={`text-xs ${content.length > 280 ? 'text-danger' : 'text-default-400'}`}>
          {content.length}/300
        </span>
        <Button
          type="submit"
          variant="primary"
          size="sm"
          isDisabled={!isValid || loading}
          isPending={loading}
        >
          {({ isPending }) =>
            isPending ? (
              <>
                <Spinner color="current" size="sm" />
                投稿中...
              </>
            ) : (
              'ツイート'
            )
          }
        </Button>
      </div>
    </form>
  )
}
