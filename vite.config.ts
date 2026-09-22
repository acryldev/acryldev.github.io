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
  resolve: {
    // The UI registry gallery (spec 038-ui-component-library) renders the real registry
    // component source unmodified; this swaps its one runtime import for a working, plain
    // stand-in (src/ui-registry/preview-primitives.tsx) instead of the ACRYL app's own
    // primitives package, which this site cannot pull in (internal, CSS-coupled to the app).
    alias: { '@deepseek-ai/dsh-client-ui-primitives': '/src/ui-registry/preview-primitives.tsx' },
  },
  build: {
    target: 'es2022',
    sourcemap: true,
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'scripts/**/*.test.mjs'],
  },
})
