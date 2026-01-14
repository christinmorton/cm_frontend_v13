export const cart = {
    /**
     * Get current cart from localStorage
     * @returns {Array} List of cart items
     */
    getCart() {
        const cartJson = localStorage.getItem('cmm_cart');
        return cartJson ? JSON.parse(cartJson) : [];
    },

    /**
     * Add item to cart
     * @param {Object} product Product object
     * @param {number} quantity 
     */
    addItem(product, quantity = 1) {
        const currentCart = this.getCart();
        const existingItemIndex = currentCart.findIndex(item => item.id === product.id);

        if (existingItemIndex > -1) {
            currentCart[existingItemIndex].quantity += quantity;
        } else {
            currentCart.push({
                id: product.id,
                name: product.name,
                price: product.price, // Assuming price is string or number, will need parsing usually
                image: product.image,
                quantity: quantity,
                permalink: product.permalink
            });
        }

        this.saveCart(currentCart);
        this.updateCount();
    },

    /**
     * Remove item from cart
     * @param {number|string} productId 
     */
    removeItem(productId) {
        const currentCart = this.getCart();
        const newCart = currentCart.filter(item => item.id !== productId);
        this.saveCart(newCart);
        this.updateCount();
    },

    /**
     * Update item quantity
     */
    updateQuantity(productId, quantity) {
        const currentCart = this.getCart();
        const item = currentCart.find(item => item.id === productId);
        if (item) {
            item.quantity = parseInt(quantity);
            if (item.quantity <= 0) {
                this.removeItem(productId);
                return;
            }
            this.saveCart(currentCart);
            this.updateCount();
        }
    },

    /**
     * Clear the cart
     */
    clearCart() {
        localStorage.removeItem('cmm_cart');
        this.updateCount();
    },

    /**
     * Internal: Save to storage
     */
    saveCart(cartData) {
        localStorage.setItem('cmm_cart', JSON.stringify(cartData));
        // Dispatch event for UI updates
        window.dispatchEvent(new Event('cartUpdated'));
    },

    /**
     * Update header cart count if element exists
     */
    updateCount() {
        const count = this.getCart().reduce((total, item) => total + item.quantity, 0);
        const badge = document.getElementById('cart-count');
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline-block' : 'none';
        }
    },

    /**
     * Calculate Total
     */
    getTotal() {
        return this.getCart().reduce((total, item) => {
            // Price might be "10.00" or 1000 (cents) depending on API. 
            // Assuming simplified number for MVP logic, will refine with real API data.
            const price = parseFloat(item.price) || 0;
            return total + (price * item.quantity);
        }, 0);
    }
};
