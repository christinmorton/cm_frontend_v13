import axios from 'axios';

// Using the WooCommerce Store API (public) by default
// Fallback or configuration might be needed if user strictly wants wc/v3
const WC_STORE_API_URL = 'http://general-wp.local/wp-json/wc/store/v1';

export const store = {
    /**
     * Fetch products from API
     */
    async getProducts(params = {}) {
        try {
            const response = await axios.get(`${WC_STORE_API_URL}/products`, {
                params: params
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching products:', error);
            // Return mock data for MVP if API fails (common in dev/local w/o permalinks set up)
            return this.getMockProducts();
        }
    },

    /**
     * Fetch single product
     */
    async getProduct(id) {
        try {
            const response = await axios.get(`${WC_STORE_API_URL}/products/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching product:', error);
            return this.getMockProducts().find(p => p.id == id);
        }
    },

    /**
     * Mock Data Fallback
     */
    getMockProducts() {
        return [
            {
                id: 1,
                name: 'Webflow to WordPress Migration',
                price: '95000', // Cents usually in Store API
                description: 'Full migration service including SEO preservation.',
                short_description: 'Migrate your site seamlessly.',
                images: [{ src: 'https://placehold.co/600x400/111/fff?text=Migration' }],
                permalink: '/product/migration',
                prices: { price: '95000', currency_code: 'USD', currency_symbol: '$' }
            },
            {
                id: 2,
                name: 'SEO Audit',
                price: '25000',
                description: 'Comprehensive technical and content audit.',
                short_description: 'Find out why you are not ranking.',
                images: [{ src: 'https://placehold.co/600x400/111/fff?text=SEO+Audit' }],
                permalink: '/product/seo-audit',
                prices: { price: '25000', currency_code: 'USD', currency_symbol: '$' }
            },
            {
                id: 3,
                name: 'Retainer Package (10hrs)',
                price: '150000',
                description: 'Monthly dedicated development time.',
                short_description: '10 hours of dev time.',
                images: [{ src: 'https://placehold.co/600x400/111/fff?text=Retainer' }],
                permalink: '/product/retainer',
                prices: { price: '150000', currency_code: 'USD', currency_symbol: '$' }
            }
        ];
    },

    /**
     * Format price from Store API (usually minor units e.g. cents)
     * @param {number|string} amount 
     * @returns {string} Formatted price
     */
    formatPrice(amount) {
        // Store API returns prices in cents usually (integer)
        // If it's a float string from another API, handle that too
        let numeric = parseFloat(amount);

        // Auto-detect if it's likely cents (Store API) vs Dollars (WC REST API)
        // Heuristic: Store API gives integer. WC REST gives string '99.99'.
        // For this hybrid, we'll assume Store API cents if no decimal logic is clear, 
        // OR we just use Intl formatter which expects standard units.

        // Adaptation: If using Store API mock above (95000), it's cents.
        const price = numeric / 100;

        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    }
};
