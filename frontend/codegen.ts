import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: 'http://localhost:3000/graphql',
  documents: ['src/lib/graphql/documents/**/*.graphql'],
  generates: {
    'src/lib/graphql/generated/': {
      preset: 'client',
    },
  },
}

export default config
