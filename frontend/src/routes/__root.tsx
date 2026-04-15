import { createRootRoute, Outlet } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { apolloClient } from '@/lib/apollo/client'
import { REFRESH_TOKEN_MUTATION } from '@/lib/graphql/operations/auth'
import { useAuthStore } from '@/lib/stores/authStore'
import { LoadingScreen } from '@/components/ui/LoadingScreen'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  const [initializing, setInitializing] = useState(true)
  const { setAuth, clearAuth } = useAuthStore()

  useEffect(() => {
    apolloClient
      .mutate({ mutation: REFRESH_TOKEN_MUTATION })
      .then(({ data }) => {
        if (data?.refreshToken) {
          setAuth(data.refreshToken.user, data.refreshToken.accessToken)
        }
      })
      .catch(() => clearAuth())
      .finally(() => setInitializing(false))
  }, [setAuth, clearAuth])

  if (initializing) return <LoadingScreen />
  return <Outlet />
}
