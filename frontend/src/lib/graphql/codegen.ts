import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: 'src/lib/graphql/schema.graphql',
  documents: ['src/lib/graphql/documents/**/*.graphql'],
  generates: {
    'src/lib/graphql/generated/': {
      preset: 'client',
      config: {
        useTypeImports: true,
      },
    },
  },
}

export default config
