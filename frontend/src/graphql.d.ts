declare module '*.graphql' {
  import type { DocumentNode } from 'graphql'
  const value: DocumentNode
  export default value
  const _: DocumentNode
  export { _ }
}
