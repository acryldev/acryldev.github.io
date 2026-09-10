import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // The site is served from the domain root, so every emitted asset URL must be
  // root-absolute. A relative base breaks deep links: `public/404.html` rewrites
  // the document URL to a nested path client-side, and any document-relative
  // `./asset` fetched afterwards resolves against that nested directory (404).
  base: '/',
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
    sourcemap: true,
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'scripts/**/*.test.mjs'],
  },
})
