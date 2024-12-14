import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { visualizer } from 'rollup-plugin-visualizer'
import viteCompression from 'vite-plugin-compression'
import purgecss from 'vite-plugin-purgecss'
import viteImagemin from 'vite-plugin-imagemin'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import path from "path"

export default defineConfig({
  plugins: [
    react(),
    // Visualization plugin to analyze bundle size
    visualizer({
      filename: './bundle-visualizer.html',
      open: true,
      gzipSize: true,
      brotliSize: true
    }),
    // Enable gzip compression
    viteCompression({
      algorithm: ['gzip', 'brotliCompress'],
      ext: ['.js', '.css', '.html', '.svg'],
      threshold: 1024 // Only compress files larger than 1kb
    }),
    // Image optimization plugin
    viteImagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 },
      svgo: {
        plugins: [
          { name: 'removeViewBox', active: false },
          { name: 'removeEmptyAttrs', active: true },
          { name: 'removeUnknownsAndDefaults', active: true }
        ]
      }
    }),
    purgecss({
      content: [
        './index.html',
        './src/**/*.{js,jsx,ts,tsx}',
        './src/**/*.{css,scss}' // Ensure CSS files are also scanned
      ],
      safelist: {
        standard: [
          /^((?!hidden).)*$/, // Preserve existing safelist pattern
          'active',           // Common utility classes
          'disabled',
          'hover:*',          // Tailwind hover states
          'focus:*',          // Tailwind focus states
          'group-*',          // Group hover/focus states
          /^(dark|light):*/   // Theme-related classes
        ],
        deep: [
          /^(dark|light)/, // Preserve entire classes starting with dark/light
          /^(enter|leave)-/  // Animation classes
        ],
        greedy: [
          /^(transition|duration|ease)-/ // Preserve animation and transition classes
        ]
      },
      blocklist: [
        'body',
        'html',
        'main'  // Prevent removing base element styles
      ],
      extractors: [
        {
          extractor: (content) => {
            // Custom extractor to catch more class names
            return content.match(/[\w-/:]+(?<!:)/g) || [];
          },
          extensions: ['html', 'js', 'jsx', 'ts', 'tsx']
        }
      ],
    }),
  ],

  // Dependency optimization
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['js-big-decimal'],
  },

  // Build settings
  build: {
    target: 'esnext',
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
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            return 'vendor'
          }
          if (id.includes('src/components')) {
            return 'components'
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js'
      }
    },
    chunkSizeWarningLimit: 500 // in kB
  },

  // CSS
  css: {
    postcss: {
      plugins: [
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
      "@components": path.resolve(__dirname, "./src/components"),
      "@utils": path.resolve(__dirname, "./src/utils")
    },
  },
  // Test configuration
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  }
})