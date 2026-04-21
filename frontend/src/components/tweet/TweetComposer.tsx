import { useMutation } from '@apollo/client/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, TextArea, Spinner } from '@heroui/react'
import { useAuthStore } from '@/lib/stores/authStore'
import { CreateTweetDocument } from '@/lib/graphql/generated/graphql'
import { extractGqlErrorMessage } from '@/lib/utils/graphqlError'
import { tweetSchema, type TweetFormValues } from '@/lib/validations/tweet'
import { FormErrorMessage } from '@/components/ui/FormErrorMessage'
import { InitialsAvatar } from '@/components/ui/InitialsAvatar'

interface TweetComposerProps {
  onSuccess?: () => void
  refetchQueries?: string[]
}

export function TweetComposer({ onSuccess, refetchQueries }: TweetComposerProps) {
  const { user } = useAuthStore()
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-3 my-2 rounded-2xl border border-border bg-surface shadow-sm p-4"
    >
      <div className="flex gap-3">
        <InitialsAvatar
          displayName={user?.displayName ?? '?'}
          username={user?.username ?? ''}
          size="md"
        />

        <div className="flex-1 min-w-0">
          <TextArea
            fullWidth
            {...register('content')}
            aria-label="投稿内容"
            aria-invalid={errors.content ? true : undefined}
            aria-describedby={errors.content ? 'post-content-error' : undefined}
            placeholder="いまどんな気分？"
            rows={3}
            maxLength={300}
            style={{ resize: 'none' }}
            className={errors.content ? 'border-danger' : undefined}
          />
          <FormErrorMessage id="post-content-error" message={errors.content?.message} />
          <FormErrorMessage message={errors.root?.message} />

          <div className="flex items-center justify-between mt-3">
            <span
              className={`text-xs tabular-nums ${
                content.length > 280 ? 'text-danger font-medium' : 'text-muted'
              }`}
            >
              {content.length}
              <span className="text-muted/60">/300</span>
            </span>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              isDisabled={!isValid || loading}
              isPending={loading}
              className="rounded-full px-5 font-semibold"
            >
              {({ isPending }) =>
                isPending ? (
                  <>
                    <Spinner color="current" size="sm" />
                    投稿中...
                  </>
                ) : (
                  '投稿する'
                )
              }
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
