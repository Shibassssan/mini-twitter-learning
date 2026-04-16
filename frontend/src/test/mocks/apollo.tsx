import type { ReactNode } from 'react'
import { MockedProvider } from '@apollo/client/testing/react'
import type { MockLink } from '@apollo/client/testing'

type Props = {
  children: ReactNode
  mocks?: ReadonlyArray<MockLink.MockedResponse>
}

export function TestApolloProvider({ children, mocks = [] }: Props) {
  return <MockedProvider mocks={mocks}>{children}</MockedProvider>
}
