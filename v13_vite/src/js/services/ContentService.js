/**
 * ContentService.js
 * Fetches public content from the WPBE Pro API (no auth required)
 */

import api from '../api.js';

export const contentService = {
    // ─────────────────────────────────────────────────────────────
    // Services
    // ─────────────────────────────────────────────────────────────
    async getServices() {
        const response = await api.get('/services');
        return response.data;
    },

    async getActiveServices() {
        const response = await api.get('/services/active');
        return response.data;
    },

    async getService(id) {
        const response = await api.get(`/services/${id}`);
        return response.data;
    },

    // ─────────────────────────────────────────────────────────────
    // Testimonials
    // ─────────────────────────────────────────────────────────────
    async getApprovedTestimonials() {
        const response = await api.get('/testimonials/approved');
        return response.data;
    },

    async getFeaturedTestimonials() {
        const response = await api.get('/testimonials/featured');
        return response.data;
    },

    // ─────────────────────────────────────────────────────────────
    // Case Studies
    // ─────────────────────────────────────────────────────────────
    async getCaseStudies() {
        const response = await api.get('/case-studies');
        return response.data;
    },

    async getFeaturedCaseStudies() {
        const response = await api.get('/case-studies/featured');
        return response.data;
    },

    // ─────────────────────────────────────────────────────────────
    // FAQs
    // ─────────────────────────────────────────────────────────────
    async getPublicFAQs() {
        const response = await api.get('/faqs/public');
        return response.data;
    },

    async getFAQsByCategory(category) {
        const response = await api.get(`/faqs/category/${category}`);
        return response.data;
    },

    // ─────────────────────────────────────────────────────────────
    // Social Proof & Dynamic Sections
    // ─────────────────────────────────────────────────────────────
    async getSocialProof() {
        const response = await api.get('/social-proof');
        return response.data;
    },

    async getDynamicSections() {
        const response = await api.get('/dynamic-sections/public');
        return response.data;
    },

    // ─────────────────────────────────────────────────────────────
    // Dynamic Cards
    // ─────────────────────────────────────────────────────────────
    async getDynamicCards() {
        const response = await api.get('/dynamic-cards/public');
        return response.data;
    },

    async getActiveDynamicCards() {
        const response = await api.get('/dynamic-cards/active');
        return response.data;
    },

    async getDynamicCardsByType(type) {
        const response = await api.get(`/dynamic-cards/type/${type}`);
        return response.data;
    },

    async getDynamicCard(id) {
        const response = await api.get(`/dynamic-cards/${id}`);
        return response.data;
    }
};
