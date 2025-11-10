import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
    hmr: {
      overlay: false,
    },
  },
  css: {
    devSourcemap: false,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios'],
    exclude: ['lucide-react'],  // Exclude to fix named export bundle issue
  },
})

// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     proxy: {
//       '/api': {
//         target: 'http://localhost:3000',
//         changeOrigin: true,
//         secure: false,
//       },
//     },
//     hmr: {
//       overlay: false,
//     },
//   },
//   css: {
//     devSourcemap: false,
//   },
//   optimizeDeps: {
//     include: ['react', 'react-dom', 'react-router-dom', 'axios'],
//     exclude: ['lucide-react', 'react-leaflet'],  // Excludes to fix bundling/export errors
//   },
// })

