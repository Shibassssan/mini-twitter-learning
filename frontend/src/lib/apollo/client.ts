import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
  Observable,
  from,
  split,
} from '@apollo/client'
import { getMainDefinition, relayStylePagination } from '@apollo/client/utilities'
import { onError } from '@apollo/client/link/error'
import { CombinedGraphQLErrors } from '@apollo/client/errors'
import ActionCableLink from 'graphql-ruby-client/subscriptions/ActionCableLink'
import { RefreshTokenDocument } from '@/lib/graphql/generated/graphql'
import { getActionCableConsumer } from '@/lib/apollo/actionCableConsumer'
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
  for (const callback of pendingRequests) {
    callback()
  }
  pendingRequests = []
}

const errorLink = onError(({ error, operation, forward }) => {
  if (!CombinedGraphQLErrors.is(error)) return

  for (const err of error.errors) {
    const code = err.extensions?.code
    if (
      code === 'AUTHENTICATION_ERROR' ||
      code === 'UNAUTHORIZED' ||
      err.message?.toLowerCase().includes('authentication required')
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
          .mutate({ mutation: RefreshTokenDocument })
          .then(({ data }) => {
            if (!data?.refreshToken) {
              throw new Error('セッションが有効ではありません')
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
})

const actionCableLink = new ActionCableLink({
  cable: getActionCableConsumer(),
})

const splitLink = split(
  ({ query }) => {
    const def = getMainDefinition(query)
    return def.kind === 'OperationDefinition' && def.operation === 'subscription'
  },
  actionCableLink,
  httpLink,
)

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, splitLink]),
  cache: new InMemoryCache({
    typePolicies: {
      User: { merge: true },
      Tweet: { merge: true },
      Query: {
        fields: {
          timeline: relayStylePagination(),
          publicTimeline: relayStylePagination(),
          userTweets: relayStylePagination(['uuid']),
          likedTweets: relayStylePagination(),
          followers: relayStylePagination(['uuid']),
          following: relayStylePagination(['uuid']),
          searchUsers: relayStylePagination(['query']),
          searchTweets: relayStylePagination(['query']),
        },
      },
    },
  }),
  dataMasking: false,
})
