/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Three.js y r3f — siempre necesarios para el visor 3D
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          // PDF — cargado solo cuando se genera un PDF
          'pdf-vendor': ['@react-pdf/renderer'],
          // React core
          'react-vendor': ['react', 'react-dom'],
          // Estado
          'state-vendor': ['zustand'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/engine/**'],
      exclude: ['src/test/**'],
    },
  },
})
