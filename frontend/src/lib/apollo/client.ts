import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  Observable,
  from,
} from '@apollo/client'
import { onError } from '@apollo/client/link/error'
import { REFRESH_TOKEN_MUTATION } from '@/lib/graphql/operations/auth'
import { useAuthStore } from '@/lib/stores/authStore'

const httpLink = new HttpLink({
  uri: '/graphql',
  credentials: 'include',
})

const authLink = new ApolloLink((operation, forward) => {
  const accessToken = useAuthStore.getState().accessToken
  operation.setContext(({ headers = {} }: { headers: Record<string, string> }) => ({
    headers: {
      ...headers,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  }))
  return forward(operation)
})

let isRefreshing = false
let pendingRequests: Array<() => void> = []

const resolvePendingRequests = () => {
  pendingRequests.forEach((callback) => callback())
  pendingRequests = []
}

const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      if (
        err.extensions?.code === 'UNAUTHORIZED' ||
        err.message?.toLowerCase().includes('unauthorized') ||
        err.message?.toLowerCase().includes('not authenticated')
      ) {
        if (isRefreshing) {
          return new Observable((observer) => {
            pendingRequests.push(() => {
              const subscriber = {
                next: observer.next.bind(observer),
                error: observer.error.bind(observer),
                complete: observer.complete.bind(observer),
              }
              forward(operation).subscribe(subscriber)
            })
          })
        }

        isRefreshing = true

        return new Observable((observer) => {
          apolloClient
            .mutate({ mutation: REFRESH_TOKEN_MUTATION })
            .then(({ data }) => {
              if(!data) {
                throw new Error("セッションが有効ではありません");
              }
              const { accessToken, user } = data.refreshToken
              useAuthStore.getState().setAuth(user, accessToken)
              resolvePendingRequests()
              const subscriber = {
                next: observer.next.bind(observer),
                error: observer.error.bind(observer),
                complete: observer.complete.bind(observer),
              }
              forward(operation).subscribe(subscriber)
            })
            .catch(() => {
              pendingRequests = []
              useAuthStore.getState().clearAuth()
              window.location.href = '/login'
              observer.error(new Error('Session expired'))
            })
            .finally(() => {
              isRefreshing = false
            })
        })
      }
    }
  }
})

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  dataMasking: false,
})
