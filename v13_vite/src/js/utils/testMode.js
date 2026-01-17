/**
 * testMode.js
 * Testing utility for bypassing auth and fetching seeded/test data from API
 *
 * Usage (Console):
 *   testMode.enable()   // Enable test mode
 *   testMode.disable()  // Disable test mode
 *   testMode.toggle()   // Toggle test mode
 *
 * Usage (Import):
 *   import { testMode } from './utils/testMode.js';
 *   if (testMode.isEnabled()) { ... }
 *
 * The toggle is persisted in localStorage so it survives page refreshes.
 */

import api from '../api.js';

const TEST_MODE_KEY = 'wpbe_test_mode';

class TestMode {
    constructor() {
        // Always read fresh from localStorage
        this._mockUser = {
            user_id: 999,
            id: 999,
            user_display_name: 'Test User',
            user_nicename: 'testuser',
            user_email: 'test@example.com',
            roles: ['client'],
            role: 'client',
            client_id: 1,
            client: {
                id: 1,
                company_name: 'Test Company Inc.',
                first_name: 'Test',
                last_name: 'User'
            },
            counts: {
                projects: 0,
                invoices_unpaid: 0,
                tickets_open: 0
            }
        };
    }

    /**
     * Check if test mode is enabled (always reads fresh from localStorage)
     */
    isEnabled() {
        return localStorage.getItem(TEST_MODE_KEY) === 'true';
    }

    /**
     * Enable test mode
     */
    enable() {
        localStorage.setItem(TEST_MODE_KEY, 'true');
        console.log('%c[TestMode] ENABLED - Reload page to see test data', 'color: #00ff00; font-weight: bold;');
        console.log('%c[TestMode] Run testMode.disable() to turn off, or refresh to apply', 'color: #888;');
        return true;
    }

    /**
     * Disable test mode
     */
    disable() {
        localStorage.removeItem(TEST_MODE_KEY);
        console.log('%c[TestMode] DISABLED - Reload page to use real data', 'color: #ff6b6b; font-weight: bold;');
        return false;
    }

    /**
     * Toggle test mode
     */
    toggle() {
        if (this.isEnabled()) {
            return this.disable();
        } else {
            return this.enable();
        }
    }

    /**
     * Get mock user data for test mode
     */
    getMockUser() {
        return { ...this._mockUser };
    }

    /**
     * Get mock client profile data for test mode
     */
    getMockClientProfile() {
        return {
            id: 1,
            company_name: 'Test Company Inc.',
            contact_name: 'Test User',
            name: 'Test User',
            email: 'test@example.com',
            phone: '(555) 123-4567',
            address: '123 Test Street',
            city: 'Test City',
            state: 'CA',
            zip: '90210',
            postal_code: '90210',
            website: 'https://testcompany.com',
            created_at: '2025-01-01'
        };
    }

    /**
     * Get mock comments data for test mode
     */
    getMockComments() {
        return [
            {
                id: 701,
                content: { rendered: '<p>This is a great article! I learned a lot about web development best practices.</p>' },
                date: '2026-01-15T10:30:00',
                link: '#',
                post_title: 'Web Development Tips',
                status: 'approved'
            },
            {
                id: 702,
                content: { rendered: '<p>Thanks for sharing this information. Very helpful for my project.</p>' },
                date: '2026-01-12T14:20:00',
                link: '#',
                post_title: 'Getting Started Guide',
                status: 'approved'
            },
            {
                id: 703,
                content: { rendered: '<p>I have a question about the third point you mentioned. Could you elaborate?</p>' },
                date: '2026-01-10T09:15:00',
                link: '#',
                post_title: 'Advanced Techniques',
                status: 'approved'
            }
        ];
    }

    /**
     * Show test mode banner on page
     */
    _showBanner() {
        let banner = document.getElementById('test-mode-banner');
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'test-mode-banner';
            banner.innerHTML = `
                <span>TEST MODE ACTIVE</span>
                <button id="test-mode-disable-btn">Disable</button>
            `;
            banner.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: linear-gradient(90deg, #ff6b6b, #ffa500);
                color: #000;
                padding: 8px 20px;
                text-align: center;
                font-weight: bold;
                font-size: 12px;
                z-index: 99999;
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 15px;
            `;
            document.body.prepend(banner);

            // Add disable button handler
            document.getElementById('test-mode-disable-btn').addEventListener('click', () => {
                this.disable();
                window.location.reload();
            });
        }
        banner.style.display = 'flex';
    }

    /**
     * Hide test mode banner
     */
    _hideBanner() {
        const banner = document.getElementById('test-mode-banner');
        if (banner) {
            banner.style.display = 'none';
        }
    }

    /**
     * Initialize - show banner if enabled
     */
    init() {
        if (this.isEnabled()) {
            this._showBanner();
        }
    }

    // ─────────────────────────────────────────────────────────────
    // TEST DATA FETCHERS
    // Try API first, fall back to mock data if no auth or API fails
    // ─────────────────────────────────────────────────────────────

    /**
     * Check if we have a JWT token (might be able to call API)
     */
    _hasAuthToken() {
        return !!localStorage.getItem('jwt_token');
    }

    /**
     * Get all projects (test data)
     * Tries API if authenticated, otherwise returns mock data
     */
    async getProjects(limit = 10) {
        // If no auth token, just return mock data immediately
        if (!this._hasAuthToken()) {
            console.log('[TestMode] No auth token, using mock projects');
            return this._getMockProjects().slice(0, limit);
        }

        try {
            const allProjects = [];

            // Try different status endpoints
            for (const status of ['in_progress', 'planning', 'completed', 'on_hold']) {
                try {
                    const response = await api.get(`/projects/status/${status}?per_page=${limit}`);
                    const projects = response.data?.data || response.data || [];
                    allProjects.push(...projects);
                } catch (e) {
                    // Continue on failure
                }
            }

            // Also try the /my endpoint
            try {
                const response = await api.get(`/projects/my?per_page=${limit}`);
                const projects = response.data?.data || response.data || [];
                allProjects.push(...projects);
            } catch (e) {
                // Continue
            }

            // If we got any data, dedupe and return
            if (allProjects.length > 0) {
                const unique = [...new Map(allProjects.map(p => [p.id, p])).values()];
                return unique.slice(0, limit);
            }

            // No data from API, return mock
            console.log('[TestMode] No projects from API, using mock data');
            return this._getMockProjects().slice(0, limit);
        } catch (error) {
            console.error('[TestMode] Failed to fetch projects:', error);
            return this._getMockProjects().slice(0, limit);
        }
    }

    /**
     * Get all invoices (test data)
     */
    async getInvoices(limit = 10) {
        if (!this._hasAuthToken()) {
            console.log('[TestMode] No auth token, using mock invoices');
            return this._getMockInvoices().slice(0, limit);
        }

        try {
            const allInvoices = [];

            for (const status of ['unpaid', 'paid', 'partial', 'overdue']) {
                try {
                    const response = await api.get(`/invoices/status/${status}?per_page=${limit}`);
                    const invoices = response.data?.data || response.data || [];
                    allInvoices.push(...invoices);
                } catch (e) {
                    // Continue
                }
            }

            try {
                const response = await api.get(`/invoices/my?per_page=${limit}`);
                const invoices = response.data?.data || response.data || [];
                allInvoices.push(...invoices);
            } catch (e) {
                // Continue
            }

            if (allInvoices.length > 0) {
                const unique = [...new Map(allInvoices.map(i => [i.id, i])).values()];
                return unique.slice(0, limit);
            }

            console.log('[TestMode] No invoices from API, using mock data');
            return this._getMockInvoices().slice(0, limit);
        } catch (error) {
            console.error('[TestMode] Failed to fetch invoices:', error);
            return this._getMockInvoices().slice(0, limit);
        }
    }

    /**
     * Get all appointments (test data)
     */
    async getAppointments(limit = 10) {
        if (!this._hasAuthToken()) {
            console.log('[TestMode] No auth token, using mock appointments');
            return this._getMockAppointments().slice(0, limit);
        }

        try {
            const allAppointments = [];

            try {
                const response = await api.get(`/appointments/upcoming?per_page=${limit}`);
                const appointments = response.data?.data || response.data || [];
                allAppointments.push(...appointments);
            } catch (e) {
                // Continue
            }

            try {
                const response = await api.get(`/appointments/my?per_page=${limit}`);
                const appointments = response.data?.data || response.data || [];
                allAppointments.push(...appointments);
            } catch (e) {
                // Continue
            }

            if (allAppointments.length > 0) {
                const unique = [...new Map(allAppointments.map(a => [a.id, a])).values()];
                return unique.slice(0, limit);
            }

            console.log('[TestMode] No appointments from API, using mock data');
            return this._getMockAppointments().slice(0, limit);
        } catch (error) {
            console.error('[TestMode] Failed to fetch appointments:', error);
            return this._getMockAppointments().slice(0, limit);
        }
    }

    /**
     * Get all tickets (test data)
     */
    async getTickets(limit = 10) {
        if (!this._hasAuthToken()) {
            console.log('[TestMode] No auth token, using mock tickets');
            return this._getMockTickets().slice(0, limit);
        }

        try {
            const allTickets = [];

            for (const status of ['open', 'in_progress', 'waiting_customer', 'resolved']) {
                try {
                    const response = await api.get(`/tickets/status/${status}?per_page=${limit}`);
                    const tickets = response.data?.data || response.data || [];
                    allTickets.push(...tickets);
                } catch (e) {
                    // Continue
                }
            }

            try {
                const response = await api.get(`/tickets/my?per_page=${limit}`);
                const tickets = response.data?.data || response.data || [];
                allTickets.push(...tickets);
            } catch (e) {
                // Continue
            }

            if (allTickets.length > 0) {
                const unique = [...new Map(allTickets.map(t => [t.id, t])).values()];
                return unique.slice(0, limit);
            }

            console.log('[TestMode] No tickets from API, using mock data');
            return this._getMockTickets().slice(0, limit);
        } catch (error) {
            console.error('[TestMode] Failed to fetch tickets:', error);
            return this._getMockTickets().slice(0, limit);
        }
    }

    /**
     * Get all conversations (test data)
     */
    async getConversations(limit = 10) {
        if (!this._hasAuthToken()) {
            console.log('[TestMode] No auth token, using mock conversations');
            return this._getMockConversations().slice(0, limit);
        }

        try {
            const response = await api.get(`/conversations/my?per_page=${limit}`);
            const data = response.data?.data || response.data || [];
            if (data.length > 0) return data;
            return this._getMockConversations().slice(0, limit);
        } catch (error) {
            console.error('[TestMode] Failed to fetch conversations:', error);
            return this._getMockConversations().slice(0, limit);
        }
    }

    /**
     * Get messages for a conversation
     */
    async getMessages(conversationId, limit = 20) {
        if (!this._hasAuthToken()) {
            console.log('[TestMode] No auth token, returning empty messages');
            return [];
        }

        try {
            const response = await api.get(`/messages/conversation/${conversationId}?per_page=${limit}`);
            return response.data?.data || response.data || [];
        } catch (error) {
            console.error('[TestMode] Failed to fetch messages:', error);
            return [];
        }
    }

    /**
     * Get public content - services (no auth required)
     */
    async getServices(limit = 10) {
        try {
            const response = await api.get(`/services/active?per_page=${limit}`);
            const data = response.data?.data || response.data || [];
            if (data.length > 0) return data;
            return this._getMockServices().slice(0, limit);
        } catch (error) {
            console.error('[TestMode] Failed to fetch services:', error);
            return this._getMockServices().slice(0, limit);
        }
    }

    /**
     * Get testimonials (no auth required)
     */
    async getTestimonials(limit = 10) {
        try {
            const response = await api.get(`/testimonials/approved?per_page=${limit}`);
            return response.data?.data || response.data || [];
        } catch (error) {
            console.error('[TestMode] Failed to fetch testimonials:', error);
            return [];
        }
    }

    /**
     * Get dynamic cards (no auth required)
     */
    async getDynamicCards(type = null, limit = 10) {
        try {
            const endpoint = type ? `/dynamic-cards/type/${type}` : '/dynamic-cards/public';
            const response = await api.get(`${endpoint}?per_page=${limit}`);
            return response.data?.data || response.data || [];
        } catch (error) {
            console.error('[TestMode] Failed to fetch dynamic cards:', error);
            return [];
        }
    }

    /**
     * Get FAQs (no auth required)
     */
    async getFaqs(category = null, limit = 20) {
        try {
            const endpoint = category ? `/faqs/category/${category}` : '/faqs/public';
            const response = await api.get(`${endpoint}?per_page=${limit}`);
            return response.data?.data || response.data || [];
        } catch (error) {
            console.error('[TestMode] Failed to fetch FAQs:', error);
            return [];
        }
    }

    /**
     * Get case studies (no auth required)
     */
    async getCaseStudies(limit = 10) {
        try {
            const response = await api.get(`/case-studies?per_page=${limit}`);
            return response.data?.data || response.data || [];
        } catch (error) {
            console.error('[TestMode] Failed to fetch case studies:', error);
            return [];
        }
    }

    /**
     * Get social proof (no auth required)
     */
    async getSocialProof(limit = 10) {
        try {
            const response = await api.get(`/social-proof?per_page=${limit}`);
            return response.data?.data || response.data || [];
        } catch (error) {
            console.error('[TestMode] Failed to fetch social proof:', error);
            return [];
        }
    }

    // ─────────────────────────────────────────────────────────────
    // MOCK DATA FALLBACKS
    // Used when API calls fail
    // ─────────────────────────────────────────────────────────────

    _getMockProjects() {
        return [
            { id: 101, project_name: 'E-Commerce Platform Redesign', start_date: '2026-01-05', status: 'in_progress', client_id: 1 },
            { id: 102, project_name: 'Mobile App Development', start_date: '2026-01-10', status: 'planning', client_id: 2 },
            { id: 103, project_name: 'SEO & Content Strategy', start_date: '2025-12-01', status: 'completed', client_id: 1 },
            { id: 104, project_name: 'Brand Identity Package', start_date: '2025-11-15', status: 'completed', client_id: 3 },
            { id: 105, project_name: 'Marketing Automation Setup', start_date: '2026-01-12', status: 'in_progress', client_id: 2 }
        ];
    }

    _getMockInvoices() {
        return [
            { id: 201, invoice_number: 'INV-2026-001', amount: 2500.00, amount_paid: 0, status: 'unpaid', due_date: '2026-02-01', client_id: 1 },
            { id: 202, invoice_number: 'INV-2026-002', amount: 5000.00, amount_paid: 2500.00, status: 'partial', due_date: '2026-01-20', client_id: 2 },
            { id: 203, invoice_number: 'INV-2025-045', amount: 1500.00, amount_paid: 1500.00, status: 'paid', due_date: '2025-12-15', client_id: 1 },
            { id: 204, invoice_number: 'INV-2026-003', amount: 3200.00, amount_paid: 0, status: 'overdue', due_date: '2026-01-10', client_id: 3 }
        ];
    }

    _getMockAppointments() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        return [
            { id: 301, appointment_type: 'consultation', appointment_date: tomorrow.toISOString().split('T')[0], start_time: '10:00:00', status: 'scheduled', client_id: 1 },
            { id: 302, appointment_type: 'project_review', appointment_date: nextWeek.toISOString().split('T')[0], start_time: '14:00:00', status: 'confirmed', client_id: 2 },
            { id: 303, appointment_type: 'discovery_call', appointment_date: tomorrow.toISOString().split('T')[0], start_time: '15:30:00', status: 'scheduled', client_id: 3 }
        ];
    }

    _getMockTickets() {
        return [
            { id: 401, ticket_number: 'TKT-00000001', subject: 'Cannot access project files', status: 'open', priority: 'high', category: 'technical', created_at: '2026-01-15' },
            { id: 402, ticket_number: 'TKT-00000002', subject: 'Invoice payment question', status: 'in_progress', priority: 'medium', category: 'billing', created_at: '2026-01-14' },
            { id: 403, ticket_number: 'TKT-00000003', subject: 'Feature request: Dark mode', status: 'waiting_customer', priority: 'low', category: 'feature', created_at: '2026-01-12' }
        ];
    }

    _getMockConversations() {
        return [
            { id: 501, subject: 'Project Updates', entity_type: 'project', entity_id: 101, last_message_at: '2026-01-16T10:30:00', unread_count: 2 },
            { id: 502, subject: 'Invoice Discussion', entity_type: 'invoice', entity_id: 201, last_message_at: '2026-01-15T14:20:00', unread_count: 0 },
            { id: 503, subject: 'General Inquiry', entity_type: null, entity_id: null, last_message_at: '2026-01-14T09:00:00', unread_count: 1 }
        ];
    }

    _getMockServices() {
        return [
            { id: 601, title: 'Website Design & Development', excerpt: 'Custom responsive websites built for conversion', base_price: 5000, pricing_model: 'project' },
            { id: 602, title: 'SEO & Content Marketing', excerpt: 'Boost your organic traffic and rankings', base_price: 1500, pricing_model: 'retainer' },
            { id: 603, title: 'Brand Identity Design', excerpt: 'Complete brand package including logo and guidelines', base_price: 3000, pricing_model: 'fixed' },
            { id: 604, title: 'Consulting & Strategy', excerpt: 'Expert guidance for your digital presence', base_price: 200, pricing_model: 'hourly' }
        ];
    }
}

// Create singleton instance
const testModeInstance = new TestMode();

// Expose to window IMMEDIATELY for console access
// This must happen before any other code runs
window.testMode = testModeInstance;

// Auto-initialize banner when DOM is ready
if (typeof document !== 'undefined') {
    const initBanner = () => {
        if (testModeInstance.isEnabled()) {
            testModeInstance.init();
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBanner);
    } else {
        initBanner();
    }
}

// Export for ES module imports
export const testMode = testModeInstance;
export default testModeInstance;
