import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readdirSync, statSync } from 'fs';

// Recursively find all HTML files
function getHtmlEntries(dir, base = '') {
  const entries = {};
  const files = readdirSync(dir);

  for (const file of files) {
    const fullPath = resolve(dir, file);
    const relativePath = base ? `${base}/${file}` : file;

    if (statSync(fullPath).isDirectory()) {
      // Skip node_modules and dist
      if (file !== 'node_modules' && file !== 'dist') {
        Object.assign(entries, getHtmlEntries(fullPath, relativePath));
      }
    } else if (file.endsWith('.html')) {
      // Use path without .html as the entry name
      const name = relativePath.replace('.html', '').replace(/\//g, '-');
      entries[name] = fullPath;
    }
  }

  return entries;
}

const htmlEntries = getHtmlEntries(resolve(__dirname));

export default defineConfig({
  base: '/',
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: htmlEntries
    }
  }
  // Note: Vite automatically exposes environment variables prefixed with VITE_
  // Create a .env file with:
  // VITE_API_BASE_URL=http://your-api-url/wp-json/wpbe/v1
  // VITE_JWT_AUTH_URL=http://your-api-url/wp-json/jwt-auth/v1
});
