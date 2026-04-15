import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
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
  component: RootComponent,
  notFoundComponent: NotFoundPage,
})

function RootComponent() {
  const [initializing, setInitializing] = useState(true)
  const { setAuth, clearAuth } = useAuthStore()

  useEffect(() => {
    apolloClient
      .mutate({ mutation: RefreshTokenDocument })
      .then(({ data }) => {
        if (data?.refreshToken) {
          setAuth(data.refreshToken.user, data.refreshToken.accessToken)
        }
      })
      .catch(() => clearAuth())
      .finally(() => setInitializing(false))
  }, [setAuth, clearAuth])

  if (initializing) return <LoadingScreen />
  return (
    <ErrorBoundary>
      <Outlet />
    </ErrorBoundary>
  )
}
