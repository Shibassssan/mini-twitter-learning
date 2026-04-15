import { CombinedGraphQLErrors } from '@apollo/client/errors'

export function extractGqlErrorMessage(
  error: unknown,
  fallback = 'エラーが発生しました',
): string {
  if (CombinedGraphQLErrors.is(error)) {
    const gqlMsg = error.errors[0]?.message
    if (gqlMsg) return gqlMsg
  }
  if (error instanceof Error) {
    if (error.message === 'Failed to fetch') return 'ネットワークエラーが発生しました'
    return error.message || fallback
  }
  return fallback
}
