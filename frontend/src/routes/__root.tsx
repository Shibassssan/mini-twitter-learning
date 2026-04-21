import { createRootRoute, Outlet } from '@tanstack/react-router'
import { apolloClient } from '@/lib/apollo/client'
import { RefreshTokenDocument } from '@/lib/graphql/generated/graphql'
import { useAuthStore } from '@/lib/stores/authStore'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { NotFoundPage } from '@/components/ui/NotFoundPage'

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
