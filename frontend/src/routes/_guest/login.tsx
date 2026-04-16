import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@apollo/client/react'
import { Button, TextField, Label, Input, FieldError, Spinner } from '@heroui/react'
import { signInSchema, type SignInFormValues } from '@/lib/validations/auth'
import { SignInDocument } from '@/lib/graphql/generated/graphql'
import { useAuthStore } from '@/lib/stores/authStore'
import { extractGqlErrorMessage } from '@/lib/utils/graphqlError'

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
      if(!data?.signIn) {
        throw new Error("ログインに失敗しました");
      }
      setAuth(data.signIn.user, data.signIn.accessToken)
      navigate({ to: '/' })
    } catch (e: unknown) {
      setError('root', { message: extractGqlErrorMessage(e, 'ログインに失敗しました') })
    }
  }

  return (
    <div className="bg-content1 rounded-xl shadow p-8">
      <h1 className="text-2xl font-bold mb-2 text-center">MiniTwitter</h1>
      <p className="text-default-500 text-sm text-center mb-6">アカウントにログイン</p>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <TextField isInvalid={!!errors.email} name="email">
          <Label>メールアドレス</Label>
          <Input
            {...register('email')}
            fullWidth
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
          />
          {errors.email && <FieldError>{errors.email.message}</FieldError>}
        </TextField>
        <TextField isInvalid={!!errors.password} name="password">
          <Label>パスワード</Label>
          <Input
            {...register('password')}
            fullWidth
            type="password"
            autoComplete="current-password"
            placeholder="パスワードを入力"
          />
          {errors.password && <FieldError>{errors.password.message}</FieldError>}
        </TextField>
        {errors.root && <p className="text-danger text-sm">{errors.root.message}</p>}
        <Button
          type="submit"
          variant="primary"
          fullWidth
          isDisabled={loading}
          isPending={loading}
          className="mt-2"
        >
          {({isPending}) => isPending ? <><Spinner color="current" size="sm" />ログイン中...</> : 'ログイン'}
        </Button>
      </form>
      <p className="text-center text-sm mt-4 text-default-500">
        アカウントをお持ちでない方は{' '}
        <Link to="/signup" className="text-primary hover:underline">
          新規登録
        </Link>
      </p>
    </div>
  )
}
