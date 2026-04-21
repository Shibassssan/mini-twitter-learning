import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { apolloClient } from '@/lib/apollo/client'
import { RefreshTokenDocument } from '@/lib/graphql/generated/graphql'
import { useAuthStore } from '@/lib/stores/authStore'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center px-4">
        <p className="text-6xl font-bold text-primary">404</p>
        <h1 className="mt-4 text-xl font-bold">ページが見つかりません</h1>
        <p className="mt-2 text-default-500 text-sm">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <Link
          to="/"
          className="mt-6 inline-block bg-primary text-white rounded-full px-6 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          ホームに戻る
        </Link>
      </div>
    </div>
  )
}

export const Route = createRootRoute({
  // 子ルートの beforeLoad より先に実行されるため、ここでセッション復元する。
  // useEffect では子ルートのガードが先に走りリダイレクトされてしまう。
  beforeLoad: async () => {
    if (useAuthStore.getState().isAuthenticated) return
    try {
      const result = await apolloClient.mutate({
        mutation: RefreshTokenDocument,
        errorPolicy: 'none',
      })
      if (result.data?.refreshToken) {
        const { user, accessToken } = result.data.refreshToken
        useAuthStore.getState().setAuth(user, accessToken)
      }
    } catch {
      // Cookie 未設定 or 期限切れ → ログインへ誘導（正常動作）
    }
  },
  pendingComponent: LoadingScreen,
  component: RootComponent,
  notFoundComponent: NotFoundPage,
})

function RootComponent() {
  return (
    <ErrorBoundary>
      <Outlet />
    </ErrorBoundary>
  )
}
