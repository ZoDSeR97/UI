import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { visualizer } from 'rollup-plugin-visualizer'
import viteCompression from 'vite-plugin-compression'
import purgecss from 'vite-plugin-purgecss'
import viteImagemin from 'vite-plugin-imagemin'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import path from "path"
import { esbuildCommonjs } from '@originjs/vite-plugin-commonjs'

// Separate chunks function for better organization
const manualChunksFunction = (id) => {
  if (id.includes('node_modules')) {
    if (id.includes('react')) return 'react-vendor'
    if (id.includes('@emotion')) return 'emotion-vendor'
    return 'vendor'
  }
  if (id.includes('src/components')) return 'components'
  if (id.includes('src/pages')) return 'pages'
  if (id.includes('src/hooks')) return 'hooks'
}

export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      fastRefresh: true,
      devTarget: 'esnext'
    }),
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
  ].filter(Boolean),

  // Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
      'clsx',
      'tailwind-merge',
      'class-variance-authority'
    ],
    exclude: [
      '@radix-ui/react-checkbox',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-progress',
      '@radix-ui/react-slider',
      '@radix-ui/react-slot',
      '@radix-ui/react-tabs',
      'framer-motion',
      'html-to-image',
      'qrcode.react',
      'uuid',
      'i18next-http-backend',
      'embla-carousel-react'
    ],
    esbuildOptions: {
      plugins: [esbuildCommonjs([
        'void-elements',
        'i18next-http-backend',
        'qrcode.react',
        'html-to-image',
        'react-confetti'
      ])],
      target: 'esnext'
    }
  },

  // Build settings
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cache: true,
    sourcemap: mode === 'development',
    reportCompressedSize: false,
    esbuildOptions: {
      // esbuild minify options
      legalComments: 'none',
      treeShaking: true,
      drop: mode === 'production' ? ['console', 'debugger'] : [],
      minifyIdentifiers: true,
      minifySyntax: true,
      minifyWhitespace: true,
      target: 'esnext'
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React bundle
          'react-vendor': [
            'react',
            'react-dom',
            'react-router-dom'
          ],
          // UI utilities bundle
          'ui-utils': [
            'clsx',
            'tailwind-merge',
            'class-variance-authority',
            'lucide-react'
          ],
          // Radix UI components bundle
          'radix': [
            '@radix-ui/react-checkbox',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-progress',
            '@radix-ui/react-slider',
            '@radix-ui/react-slot',
            '@radix-ui/react-tabs'
          ],
          // Animations and effects
          'animations': [
            'framer-motion',
            'react-confetti'
          ],
          // i18n bundle
          'i18n': [
            'i18next-http-backend',
            'react-i18next'
          ]
        }, 
        ...manualChunksFunction,
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
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
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    },
    hmr: {
      overlay: true
    },
    watch: {
      usePolling: true,
      interval: 100
    }
  },

  // TypeScript configuration
  resolve: {
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],  // Added more extensions
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
}))