import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'

export default defineConfig({
  plugins: [
    react(),
    mdx({
      // ensure MDX compiles to React JSX
      jsxImportSource: 'react',
      providerImportSource: '@mdx-js/react',
      remarkPlugins: [remarkFrontmatter, remarkGfm],
      rehypePlugins: [rehypeSlug],
      // optional: treat .md files as MDX too
      // format: 'detect'
    }),
  ],
  build: {
    outDir: 'dist',
    // strongly recommend cleaning to avoid stale assets on Vercel
    emptyOutDir: true,
    // Disable sourcemaps in production to reduce memory usage on Vercel
    // (Vercel 8GB limit can be exceeded with large assets + sourcemaps)
    sourcemap: false,
    // Target ES2017+ for better iOS Safari compatibility
    target: 'es2017',
    // Increase chunk size warning limit (we have large video files)
    chunkSizeWarningLimit: 5000,
  },
  server: {
    proxy: {
      // Forward API calls to the serverless host in dev (vercel dev runs on 3000 by default)
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.mdx'],
  },
})
