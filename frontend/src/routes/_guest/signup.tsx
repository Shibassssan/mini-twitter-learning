import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@apollo/client/react'
import { Button, TextField, Label, Input, FieldError, Spinner } from '@heroui/react'
import { signUpSchema, type SignUpFormValues } from '@/lib/validations/auth'
import { SignUpDocument } from '@/lib/graphql/generated/graphql'
import { useAuthStore } from '@/lib/stores/authStore'
import { extractGqlErrorMessage } from '@/lib/utils/graphqlError'
import { AppIcon } from '@/components/icons/AppIcon'

export const Route = createFileRoute('/_guest/signup')({
  component: SignupPage,
})

function SignupPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [signUp, { loading }] = useMutation(SignUpDocument)
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
  })

  const onSubmit = async (values: SignUpFormValues) => {
    try {
      const { data } = await signUp({
        variables: {
          username: values.username,
          displayName: values.displayName,
          email: values.email,
          password: values.password,
        },
      })
      if (!data?.signUp) {
        throw new Error('登録に失敗しました')
      }
      setAuth(data.signUp.user, data.signUp.accessToken)
      navigate({ to: '/' })
    } catch (e: unknown) {
      setError('root', { message: extractGqlErrorMessage(e, '登録に失敗しました') })
    }
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Logo */}
      <div className="flex flex-col items-center gap-3">
        <AppIcon />
        <h1 className="text-3xl font-bold text-foreground tracking-tight">MiniPost</h1>
        <p className="text-muted text-sm">新規アカウント登録</p>
      </div>

      {/* Card */}
      <div className="w-full rounded-2xl bg-surface p-8 shadow-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          <TextField isInvalid={!!errors.username} name="username">
            <Label className="text-accent text-sm font-medium">ユーザー名</Label>
            <Input
              {...register('username')}
              fullWidth
              type="text"
              autoComplete="username"
              placeholder="例: john_doe"
              className="mt-1"
            />
            {errors.username && <FieldError>{errors.username.message}</FieldError>}
          </TextField>

          <TextField isInvalid={!!errors.displayName} name="displayName">
            <Label className="text-accent text-sm font-medium">表示名</Label>
            <Input
              {...register('displayName')}
              fullWidth
              type="text"
              autoComplete="name"
              placeholder="例: John Doe"
              className="mt-1"
            />
            {errors.displayName && <FieldError>{errors.displayName.message}</FieldError>}
          </TextField>

          <TextField isInvalid={!!errors.email} name="email">
            <Label className="text-accent text-sm font-medium">メールアドレス</Label>
            <Input
              {...register('email')}
              fullWidth
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              className="mt-1"
            />
            {errors.email && <FieldError>{errors.email.message}</FieldError>}
          </TextField>

          <TextField isInvalid={!!errors.password} name="password">
            <Label className="text-accent text-sm font-medium">パスワード</Label>
            <Input
              {...register('password')}
              fullWidth
              type="password"
              autoComplete="new-password"
              placeholder="8文字以上"
              className="mt-1"
            />
            {errors.password && <FieldError>{errors.password.message}</FieldError>}
          </TextField>

          <TextField isInvalid={!!errors.passwordConfirm} name="passwordConfirm">
            <Label className="text-accent text-sm font-medium">パスワード（確認）</Label>
            <Input
              {...register('passwordConfirm')}
              fullWidth
              type="password"
              autoComplete="new-password"
              placeholder="もう一度入力"
              className="mt-1"
            />
            {errors.passwordConfirm && <FieldError>{errors.passwordConfirm.message}</FieldError>}
          </TextField>

          {errors.root && (
            <p className="text-danger text-sm rounded-lg bg-danger/10 px-3 py-2">
              {errors.root.message}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isDisabled={loading}
            isPending={loading}
            className="mt-1 h-12 rounded-xl text-base font-semibold"
          >
            {({ isPending }) =>
              isPending ? (
                <>
                  <Spinner color="current" size="sm" />
                  登録中...
                </>
              ) : (
                '新規登録'
              )
            }
          </Button>
        </form>

        <p className="text-center text-sm mt-5 text-muted">
          すでにアカウントをお持ちの方は{' '}
          <Link to="/login" className="text-accent font-medium hover:underline">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  )
}
