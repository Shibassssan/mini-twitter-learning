import { z } from 'zod'

export const tweetSchema = z.object({
  content: z
    .string()
    .min(1, 'ツイートを入力してください')
    .max(300, 'ツイートは300文字以内で入力してください'),
})

export type TweetFormValues = z.infer<typeof tweetSchema>
