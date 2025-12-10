import { defineConfig } from 'vitest/config'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      '@jiangding/usk-template': fileURLToPath(
        new URL('../template/src/index.ts', import.meta.url)
      )
    }
  },
  test: {
    environment: 'node'
  }
})
