import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts', 'src/nuxt.ts', 'src/cli/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  external: ['@nuxt/kit', '@nuxt/schema', 'nuxt'],
})
