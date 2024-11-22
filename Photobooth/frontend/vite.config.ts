import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { visualizer } from 'rollup-plugin-visualizer'
import viteCompression from 'vite-plugin-compression'
import purgecss from '@fullhuman/postcss-purgecss'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import path from "path"

export default defineConfig({
  plugins: [
    react(),
    // Visualization plugin to analyze bundle size
    visualizer({
      filename: './bundle-visualizer.html',
      open: true
    }),
    // Enable gzip compression
    viteCompression({
      algorithm: 'gzip'
    })
  ],

  // Dependency optimization
  optimizeDeps: {
    include: ['react', 'react-dom']
  },

  // Build settings
  build: {
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        passes: 2,
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        }
      }
    }
  },

  // CSS Optimization with PurgeCSS and Tailwind
  css: {
    postcss: {
      plugins: [
        purgecss({
          content: ['./index.html', './src/**/*.tsx'],
          defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || []
        }),
        tailwindcss(),
        autoprefixer()
      ]
    }
  },

  server: {
    proxy: {
      '/api': {
        target: 'http://172.30.174.2:5000',
        changeOrigin: true
      }
    }
  },

  // TypeScript configuration
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts']
  }
})