import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const backend = process.env.API_TARGET || 'http://localhost:3000'
const CDN_BASE = 'https://cdn.jsdelivr.net/gh/hasaneyldrm/exercises-dataset@7455efae41b330c265e7cd4b78dfa848e7ce5ebd'
const media = process.env.MEDIA_TARGET || null

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    proxy: {
      '/api': { target: backend, changeOrigin: true },
      ...(media
        ? {
            '/img': { target: media, changeOrigin: true },
            '/gif': { target: media, changeOrigin: true }
          }
        : {
            '/img': {
              target: CDN_BASE,
              changeOrigin: true,
              rewrite: path => path.replace(/^\/img/, '/images')
            },
            '/gif': {
              target: CDN_BASE,
              changeOrigin: true,
              rewrite: path => path.replace(/^\/gif/, '/videos')
            }
          })
    }
  },
  build: { chunkSizeWarningLimit: 1500 }
})
