/**
 * ClientService.js
 * Client profile management
 */

import api from '../api.js';

export const clientService = {
    /**
     * Get current client's profile
     */
    async getProfile() {
        const response = await api.get('/clients/me');
        return response.data;
    },

    /**
     * Update client profile (limited fields)
     * @param {number} clientId - Client ID
     * @param {Object} data - Fields to update (company_name, phone, etc.)
     */
    async updateProfile(clientId, data) {
        const response = await api.put(`/clients/${clientId}`, data);
        return response.data;
    }
};
