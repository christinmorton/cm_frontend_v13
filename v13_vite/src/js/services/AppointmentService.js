/**
 * AppointmentService.js
 * Appointment booking and management
 */

import api from '../api.js';

export const appointmentService = {
    /**
     * Get user's appointments
     */
    async getMyAppointments() {
        const response = await api.get('/appointments/my');
        return response.data;
    },

    /**
     * Get upcoming appointments
     */
    async getUpcoming() {
        const response = await api.get('/appointments/upcoming');
        return response.data;
    },

    /**
     * Get available slots for a date (public endpoint)
     */
    async getAvailableSlots(date) {
        const response = await api.get(`/appointments/available-slots?date=${date}`);
        return response.data;
    },

    /**
     * Book an appointment
     */
    async book(data) {
        const response = await api.post('/appointments', data);
        return response.data;
    }
};
