import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import graphql from '@rollup/plugin-graphql'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  plugins: [
    TanStackRouterVite({ routesDirectory: './src/routes', generatedRouteTree: './src/routeTree.gen.ts' }),
    react(),
    tailwindcss(),
    graphql(),
  ],
  server: {
    proxy: {
      '/graphql': 'http://localhost:3000',
    },
  },
})
