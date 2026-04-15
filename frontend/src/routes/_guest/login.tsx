import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@apollo/client/react'
import { signInSchema, type SignInFormValues } from '@/lib/validations/auth'
import { SignInDocument } from '@/lib/graphql/generated/graphql'
import { useAuthStore } from '@/lib/stores/authStore'

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
      const msg = e instanceof Error ? e.message : 'ログインに失敗しました'
      setError('root', { message: msg })
    }
  }

  return (
    <div className="bg-content1 rounded-xl shadow p-8">
      <h1 className="text-2xl font-bold mb-2 text-center">MiniTwitter</h1>
      <p className="text-default-500 text-sm text-center mb-6">アカウントにログイン</p>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium">メールアドレス</label>
          <input
            {...register('email')}
            type="email"
            autoComplete="email"
            className="w-full border border-divider rounded-lg px-3 py-2 mt-1 bg-background text-sm focus:outline-none focus:border-primary"
          />
          {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium">パスワード</label>
          <input
            {...register('password')}
            type="password"
            autoComplete="current-password"
            className="w-full border border-divider rounded-lg px-3 py-2 mt-1 bg-background text-sm focus:outline-none focus:border-primary"
          />
          {errors.password && <p className="text-danger text-xs mt-1">{errors.password.message}</p>}
        </div>
        {errors.root && <p className="text-danger text-sm">{errors.root.message}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white rounded-lg py-2 font-medium disabled:opacity-50 mt-2"
        >
          {loading ? 'ログイン中...' : 'ログイン'}
        </button>
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
