/**
 * TicketService.js
 * Support ticket management
 */

import api from '../api.js';

export const ticketService = {
    /**
     * Get user's tickets
     */
    async getMyTickets() {
        const response = await api.get('/tickets/my');
        return response.data;
    },

    /**
     * Get open tickets
     */
    async getOpenTickets() {
        const response = await api.get('/tickets/open');
        return response.data;
    },

    /**
     * Get tickets by status
     */
    async getByStatus(status) {
        const response = await api.get(`/tickets/status/${status}`);
        return response.data;
    },

    /**
     * Get single ticket
     */
    async getTicket(id) {
        const response = await api.get(`/tickets/${id}`);
        return response.data;
    },

    /**
     * Create a new ticket
     */
    async create(data) {
        const response = await api.post('/tickets', data);
        return response.data;
    },

    /**
     * Update ticket (description only for clients)
     */
    async update(id, data) {
        const response = await api.put(`/tickets/${id}`, data);
        return response.data;
    }
};
