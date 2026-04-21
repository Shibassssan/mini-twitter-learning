import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@apollo/client/react'
import { Button, TextField, Label, Input, FieldError, Spinner } from '@heroui/react'
import { signInSchema, type SignInFormValues } from '@/lib/validations/auth'
import { SignInDocument } from '@/lib/graphql/generated/graphql'
import { useAuthStore } from '@/lib/stores/authStore'
import { extractGqlErrorMessage } from '@/lib/utils/graphqlError'
import { AppIcon } from '@/components/icons/AppIcon'

export const Route = createFileRoute('/_guest/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [signIn, { loading }] = useMutation(SignInDocument)
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
  })

  const onSubmit = async (values: SignInFormValues) => {
    try {
      const { data } = await signIn({ variables: values })
      if (!data?.signIn) {
        throw new Error('ログインに失敗しました')
      }
      setAuth(data.signIn.user, data.signIn.accessToken)
      navigate({ to: '/' })
    } catch (e: unknown) {
      setError('root', { message: extractGqlErrorMessage(e, 'ログインに失敗しました') })
    }
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Logo */}
      <div className="flex flex-col items-center gap-3">
        <AppIcon />
        <h1 className="text-3xl font-bold text-foreground tracking-tight">MiniPost</h1>
        <p className="text-muted text-sm">アカウントにログイン</p>
      </div>

      {/* Card */}
      <div className="w-full rounded-2xl bg-surface p-8 shadow-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
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
              autoComplete="current-password"
              placeholder="パスワードを入力"
              className="mt-1"
            />
            {errors.password && <FieldError>{errors.password.message}</FieldError>}
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
                  ログイン中...
                </>
              ) : (
                'ログイン'
              )
            }
          </Button>
        </form>

        <p className="text-center text-sm mt-5 text-muted">
          アカウントをお持ちでない方は{' '}
          <Link to="/signup" className="text-accent font-medium hover:underline">
            新規登録
          </Link>
        </p>
      </div>
    </div>
  )
}
