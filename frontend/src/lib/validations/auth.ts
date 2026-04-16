import { z } from 'zod'

export const signUpSchema = z
  .object({
    username: z
      .string()
      .min(3, 'ユーザー名は3文字以上で入力してください')
      .max(15, 'ユーザー名は15文字以内で入力してください')
      .regex(/^[a-zA-Z0-9_]+$/, 'ユーザー名は英数字とアンダースコアのみ使用できます'),
    displayName: z
      .string()
      .min(1, '表示名を入力してください')
      .max(50, '表示名は50文字以内で入力してください'),
    email: z.string().email('有効なメールアドレスを入力してください'),
    password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'パスワードが一致しません',
    path: ['passwordConfirm'],
  })

export type SignUpFormValues = z.infer<typeof signUpSchema>

export const signInSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
})

export type SignInFormValues = z.infer<typeof signInSchema>
