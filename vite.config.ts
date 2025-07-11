import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
/** @type {import('vite').UserConfig} */
export default defineConfig({
  plugins: [react()],
  base: '/functionFinder/',
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        404: '404.html',
      },
    },
  },
})