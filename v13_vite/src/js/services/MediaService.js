/**
 * MediaService.js
 * File upload with guest token support
 */

import { guestManager } from '../tracking/GuestManager.js';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://general-wp.local/wp-json/wpbe/v1';

export const mediaService = {
    /**
     * Upload files to the server
     * @param {File[]} files - Array of File objects to upload
     * @returns {Promise<Object>} Upload response with file data
     */
    async upload(files) {
        const formData = new FormData();

        // Append files
        files.forEach(file => {
            formData.append('files[]', file);
        });

        // Include guest ID if available
        const guestId = guestManager.getGuestId();
        if (guestId) {
            formData.append('guest_id', guestId);
        }

        // Build headers
        const headers = {};

        // Add JWT token if logged in
        const jwtToken = localStorage.getItem('jwt_token');
        if (jwtToken) {
            headers['Authorization'] = `Bearer ${jwtToken}`;
        }

        // Add guest token if available
        const guestToken = guestManager.getToken();
        if (guestToken) {
            headers['X-Guest-Token'] = guestToken;
        }

        const response = await fetch(`${API_BASE}/media/upload`, {
            method: 'POST',
            headers,
            body: formData
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Upload failed' }));
            throw new Error(error.message || 'Upload failed');
        }

        return response.json();
    },

    /**
     * Validate file before upload
     * @param {File} file - File to validate
     * @param {Object} options - Validation options
     * @returns {Object} { valid: boolean, error?: string }
     */
    validate(file, options = {}) {
        const {
            maxSize = 10 * 1024 * 1024, // 10MB default
            allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
        } = options;

        if (file.size > maxSize) {
            return { valid: false, error: `File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB.` };
        }

        if (allowedTypes.length && !allowedTypes.includes(file.type)) {
            return { valid: false, error: 'File type not allowed.' };
        }

        return { valid: true };
    }
};
