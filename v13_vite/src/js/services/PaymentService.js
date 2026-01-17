/**
 * PaymentService.js
 * Handles Stripe checkout flow for invoice payments
 */

import api from '../api.js';

/**
 * Payment types
 */
export const PAYMENT_TYPES = {
    FULL: 'full',
    DEPOSIT: 'deposit',
    PARTIAL: 'partial'
};

/**
 * Payment Service
 */
export const paymentService = {
    /**
     * Check if Stripe is configured and ready
     * @returns {Promise<Object>} { configured, test_mode, currency }
     */
    async getStripeStatus() {
        const response = await api.get('/stripe/status');
        return response.data || response;
    },

    /**
     * Create a Stripe Checkout session and redirect to payment
     * @param {Object} options - Payment options
     * @param {number} options.invoiceId - Invoice post ID (required)
     * @param {number} options.amount - Amount in dollars (required)
     * @param {string} options.clientEmail - Client email (required)
     * @param {string} [options.invoiceNumber] - Invoice number for display
     * @param {string} [options.clientName] - Client name for display
     * @param {string} [options.paymentType='full'] - Payment type (full, deposit, partial)
     * @param {string} [options.returnUrl] - Custom return URL (defaults to /payment-complete.html)
     * @returns {Promise<Object>} { session_id, checkout_url }
     */
    async createCheckoutSession(options) {
        const {
            invoiceId,
            amount,
            clientEmail,
            invoiceNumber,
            clientName,
            paymentType = PAYMENT_TYPES.FULL,
            returnUrl
        } = options;

        if (!invoiceId) {
            throw new Error('Invoice ID is required');
        }
        if (!amount || amount <= 0) {
            throw new Error('Valid amount is required');
        }
        if (!clientEmail) {
            throw new Error('Client email is required');
        }

        const response = await api.post('/stripe/checkout', {
            invoice_id: invoiceId,
            amount: amount,
            client_email: clientEmail,
            invoice_number: invoiceNumber,
            client_name: clientName,
            payment_type: paymentType,
            return_url: returnUrl || `${window.location.origin}/payment-complete.html`
        });

        return response.data || response;
    },

    /**
     * Start payment flow - creates session and redirects to Stripe
     * @param {Object} options - Same as createCheckoutSession
     */
    async startPayment(options) {
        const { session_id, checkout_url } = await this.createCheckoutSession(options);

        // Store session_id for verification on return
        sessionStorage.setItem('stripe_session', session_id);

        // Redirect to Stripe Checkout
        window.location.href = checkout_url;
    },

    /**
     * Get the status of a checkout session
     * @param {string} sessionId - Stripe session ID
     * @returns {Promise<Object>} { session_id, payment_status, status, invoice_id }
     */
    async getSessionStatus(sessionId) {
        if (!sessionId) {
            throw new Error('Session ID is required');
        }

        const response = await api.get(`/stripe/session/${sessionId}`);
        return response.data || response;
    },

    /**
     * Verify payment on return page
     * Checks URL params and session storage for session ID
     * @returns {Promise<Object>} { success, status, message, invoiceId }
     */
    async verifyPayment() {
        const params = new URLSearchParams(window.location.search);
        const urlStatus = params.get('status');
        const sessionId = params.get('session_id') || sessionStorage.getItem('stripe_session');

        // Clean up session storage
        sessionStorage.removeItem('stripe_session');

        // Handle cancelled payment
        if (urlStatus === 'cancelled') {
            return {
                success: false,
                status: 'cancelled',
                message: 'Payment was cancelled.'
            };
        }

        // No session ID available
        if (!sessionId) {
            return {
                success: false,
                status: 'error',
                message: 'No payment session found.'
            };
        }

        try {
            const result = await this.getSessionStatus(sessionId);

            if (result.payment_status === 'paid') {
                return {
                    success: true,
                    status: 'paid',
                    message: 'Payment successful! Thank you.',
                    invoiceId: result.invoice_id,
                    sessionId: result.session_id
                };
            } else if (result.status === 'complete') {
                return {
                    success: true,
                    status: 'processing',
                    message: 'Payment processing. You will receive confirmation shortly.',
                    invoiceId: result.invoice_id,
                    sessionId: result.session_id
                };
            } else {
                return {
                    success: false,
                    status: result.payment_status || 'unknown',
                    message: 'Payment status could not be verified.',
                    invoiceId: result.invoice_id,
                    sessionId: result.session_id
                };
            }
        } catch (error) {
            console.error('Error verifying payment:', error);
            return {
                success: false,
                status: 'error',
                message: 'Unable to verify payment status. Please contact support if you were charged.'
            };
        }
    }
};
