import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
  // Note: Vite automatically exposes environment variables prefixed with VITE_
  // Create a .env file with:
  // VITE_API_BASE_URL=http://your-api-url/wp-json/wpbe/v1
  // VITE_JWT_AUTH_URL=http://your-api-url/wp-json/jwt-auth/v1
});
