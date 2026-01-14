import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    base: '/',
    build: {
      rollupOptions: {
        input: {
          // HTML entry points
          main: resolve(__dirname, 'index.html'),
          about: resolve(__dirname, 'about.html'),
          services: resolve(__dirname, 'service.html'), // Note: renamed to 'services' for better URL
          contact: resolve(__dirname, 'contact.html'),

          // JavaScript entry points (for optimal bundling)
          'js-core': resolve(__dirname, 'js/core.js'),
          'js-home': resolve(__dirname, 'js/pages/home.js'),
          'js-about': resolve(__dirname, 'js/pages/about.js'),
          'js-service': resolve(__dirname, 'js/pages/service.js'),
          'js-contact': resolve(__dirname, 'js/pages/contact.js'),
          'js-checkout': resolve(__dirname, 'js/pages/checkout.js'),
          'js-checkout-free': resolve(__dirname, 'js/pages/checkout-free.js'),
          'js-checkout-custom': resolve(__dirname, 'js/pages/checkout-custom.js'),
          'js-consultation-booking': resolve(__dirname, 'js/pages/consultation-booking.js'),
          'js-project-quote': resolve(__dirname, 'js/pages/project-quote.js'),
          'js-free-consultation': resolve(__dirname, 'js/pages/free-consultation.js'),
          'js-project-discovery': resolve(__dirname, 'js/pages/project-discovery.js'),

          // Consultation and booking flows
          consultation: resolve(__dirname, 'free-consultation.html'),
          'consultation/book': resolve(__dirname, 'consultation-booking.html'),
          'consultation/book/success': resolve(__dirname, 'consultation-booking-thank-you.html'),
          'consultation/success': resolve(__dirname, 'consultation-thank-you.html'),

          // Project discovery and quotes
          'project/discovery': resolve(__dirname, 'project-discovery.html'),
          'project/discovery/success': resolve(__dirname, 'project-discovery-thank-you.html'),
          'project/quote': resolve(__dirname, 'project-quote.html'),
          'project/quote/success': resolve(__dirname, 'quote-thank-you.html'),

          // Payment and checkout flows
          checkout: resolve(__dirname, 'checkout.html'),
          'checkout/free': resolve(__dirname, 'checkout-free.html'),
          'checkout/custom': resolve(__dirname, 'checkout-custom.html'),
          'payment/success': resolve(__dirname, 'payment-success.html'),
          'payment/cancel': resolve(__dirname, 'payment-cancel.html'),

          // General thank you page
          'thank-you': resolve(__dirname, 'thank-you.html'),

          // Excluded from build (not production ready):
          // - 404.html
          // - portfolio.html
          // - portfolio-details.html
          // - portfolio-masonry.html
          // - blog.html
          // - single-post.html
        },
        output: {
          entryFileNames: (chunkInfo) => {
            // Custom entry file naming for clean URLs
            const facadeModuleId = chunkInfo.facadeModuleId;
            if (facadeModuleId && facadeModuleId.endsWith('.html')) {
              // Keep the key name as the path structure
              return `assets/[name]-[hash].js`;
            }
            return `assets/[name]-[hash].js`;
          }
        }
      }
    },
    define: {
      __WORDPRESS_APP_USER__: JSON.stringify(env.WORDPRESS_APP_USER),
      __WORDPRESS_APP_PASSWORD__: JSON.stringify(env.WORDPRESS_APP_PASSWORD),
      __WORDPRESS_API_BASE_DEV__: JSON.stringify(env.WORDPRESS_API_BASE_DEV),
      __WORDPRESS_API_BASE_PROD__: JSON.stringify(env.WORDPRESS_API_BASE_PROD),
      __STRIPE_PUBLISHABLE_KEY_DEV__: JSON.stringify(env.VITE_STRIPE_PUBLISHABLE_KEY_DEV),
      __STRIPE_PUBLISHABLE_KEY_PROD__: JSON.stringify(env.VITE_STRIPE_PUBLISHABLE_KEY_PROD),
      __STRIPE_PRICE_ID_WEB_DEV_STARTER_DEV__: JSON.stringify(env.VITE_STRIPE_PRICE_ID_WEB_DEV_STARTER_DEV),
      __STRIPE_PRICE_ID_WEB_DEV_STANDARD_DEV__: JSON.stringify(env.VITE_STRIPE_PRICE_ID_WEB_DEV_STANDARD_DEV),
      __STRIPE_PRICE_ID_WEB_DEV_PREMIUM_DEV__: JSON.stringify(env.VITE_STRIPE_PRICE_ID_WEB_DEV_PREMIUM_DEV),
      __STRIPE_PRICE_ID_CONSULTATION_DEV__: JSON.stringify(env.VITE_STRIPE_PRICE_ID_CONSULTATION_DEV),
      __STRIPE_PRICE_ID_WEB_DEV_STARTER_PROD__: JSON.stringify(env.VITE_STRIPE_PRICE_ID_WEB_DEV_STARTER_PROD),
      __STRIPE_PRICE_ID_WEB_DEV_STANDARD_PROD__: JSON.stringify(env.VITE_STRIPE_PRICE_ID_WEB_DEV_STANDARD_PROD),
      __STRIPE_PRICE_ID_WEB_DEV_PREMIUM_PROD__: JSON.stringify(env.VITE_STRIPE_PRICE_ID_WEB_DEV_PREMIUM_PROD),
      __STRIPE_PRICE_ID_CONSULTATION_PROD__: JSON.stringify(env.VITE_STRIPE_PRICE_ID_CONSULTATION_PROD)
    }
  }
});
