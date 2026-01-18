import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  // Base public path - adjust if deploying to a subdirectory
  base: '/',
  
  build: {
    // Output directory (default: dist)
    outDir: 'dist',
    
    // Generate sourcemaps for debugging in production (optional)
    sourcemap: false,
    
    // Minify output
    minify: 'esbuild',
    
    // Rollup options
    rollupOptions: {
      output: {
        // Chunk naming for better caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
  },

  // Development server options
  server: {
    port: 3000,
    open: true,
    // Proxy API calls to WordPress backend during development
    proxy: {
      '/wp-json': {
        target: 'https://cms.christinmorton.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },

  // Preview server (for testing production build locally)
  preview: {
    port: 4173,
  },
})
