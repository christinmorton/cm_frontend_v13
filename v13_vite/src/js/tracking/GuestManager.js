/**
 * GuestManager.js
 * Handles guest identification and session management.
 */

// Get API base URL from environment variable, with fallback
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://general-wp.local/wp-json/wpbe/v1';

export const guestManager = {
    /**
     * Validates an existing guest session by checking if the token is still valid.
     * @param {string} guestId - The guest ID to validate
     * @param {string} token - The session token to validate
     * @returns {Promise<boolean>} True if the guest session is valid, false otherwise
     */
    async validateGuest(guestId, token) {
        if (!guestId || !token) {
            return false;
        }

        try {
            const response = await fetch(`${API_BASE}/guests/${guestId}/touch`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Guest-Token': token
                }
            });

            // 200/201 means the token is valid
            if (response.ok) {
                return true;
            }

            // 401/403 means the token is invalid or expired
            if (response.status === 401 || response.status === 403) {
                return false;
            }

            // Other errors - assume invalid for safety
            return false;
        } catch (error) {
            // Network errors - can't validate, assume invalid
            return false;
        }
    },

    /**
     * Ensures a guest session exists.
     * Checks localStorage for existing token, validates it, or creates a new guest via API.
     * @returns {Promise<string|null>} The guest ID, or null if opted out/error.
     */
    async ensureGuest() {
        if (localStorage.getItem('wpbe_opt_out') === 'true') {
            return null;
        }

        // Check for existing guest ID and token in localStorage
        const existingGuestId = this.getGuestId();
        const existingToken = this.getToken();

        // If we have both ID and token, try to validate the session
        if (existingGuestId && existingToken) {
            const isValid = await this.validateGuest(existingGuestId, existingToken);
            
            if (isValid) {
                // Session is valid, update last seen date and return existing guest ID
                localStorage.setItem('wpbe_guest_date', new Date().toDateString());
                return existingGuestId;
            } else {
                // Token is invalid, clear the session and create a new one
                console.info('Guest session expired or invalid. Creating new session...');
                this.resetSession();
            }
        }

        // No valid session found, create a new guest
        try {
            const response = await fetch(`${API_BASE}/guests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_agent: navigator.userAgent,
                    referrer_url: document.referrer,
                    utm_source: new URLSearchParams(window.location.search).get('utm_source'),
                    utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
                    utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign')
                })
            });

            if (!response.ok) {
                console.warn('Guest API error:', response.status);
                return null;
            }

            const { data } = await response.json();

            if (data && data.guest_id && data.session_token) {
                localStorage.setItem('wpbe_guest_id', data.guest_id);
                localStorage.setItem('wpbe_guest_token', data.session_token);
                localStorage.setItem('wpbe_guest_date', new Date().toDateString());
                return data.guest_id;
            }
        } catch (error) {
            console.error('Failed to create guest:', error);
        }

        return null;
    },

    /**
     * Checks if a guest session is currently active locally.
     * @returns {boolean}
     */
    hasGuest() {
        return !!localStorage.getItem('wpbe_guest_id');
    },

    /**
     * Gets the current guest ID.
     * @returns {string|null}
     */
    getGuestId() {
        return localStorage.getItem('wpbe_guest_id');
    },

    /**
     * Gets the current session token.
     * @returns {string|null}
     */
    getToken() {
        return localStorage.getItem('wpbe_guest_token');
    },

    /**
     * Converts the current guest to a lead/contact.
     * @param {string} formId 
     * @param {object} formData 
     * @returns {Promise<boolean>} Success status
     */
    /**
     * Resets the guest session.
     */
    resetSession() {
        localStorage.removeItem('wpbe_guest_id');
        localStorage.removeItem('wpbe_guest_token');
        localStorage.removeItem('wpbe_guest_date');
    },

    /**
     * Converts the current guest to a lead/contact.
     * @param {string} formId 
     * @param {object} formData 
     * @returns {Promise<boolean>} Success status
     */
    async convertGuest(formId, formData) {
        // If we don't have a guest, try to create one first
        if (!this.hasGuest()) {
            await this.ensureGuest();
        }
        
        if (!this.hasGuest()) return false;

        const performRequest = async (shouldRetry = true) => {
            try {
                const response = await fetch(`${API_BASE}/guests/${this.getGuestId()}/convert`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Guest-Token': this.getToken()
                    },
                    body: JSON.stringify({
                        form_id: formId,
                        form_data: formData
                    })
                });

                // If invalid token (401/403), reset and retry once
                if ((response.status === 401 || response.status === 403) && shouldRetry) {
                    console.warn('Guest token invalid. Resetting session...');
                    this.resetSession();
                    await this.ensureGuest(); // Create new guest
                    return performRequest(false); // Retry once
                }

                if (!response.ok) {
                    console.warn('Guest conversion failed:', response.status);
                    return false;
                }
                return true;
            } catch (error) {
                console.error('Conversion error:', error);
                return false;
            }
        };

        return performRequest();
    }

};
