/**
 * dashboard.js
 * Client Portal Dashboard
 *
 * User Types:
 * - Client: Has client_id or role='client' - Full access (projects, invoices, appointments, messages, tickets)
 * - Member: Basic WP account - Limited access (messages, tickets, appointments, can become a client)
 */

import { auth } from './auth.js';
import api from './api.js';
import { messageService } from './services/MessageService.js';

// 1. Guard: Check Auth immediately
auth.requireAuth();

// 2. Reveal App after check
document.getElementById('dashboard-app').style.display = 'block';

// 3. Initialize Dashboard
document.addEventListener('DOMContentLoaded', async () => {

    // Setup Logout
    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        auth.logout();
    });

    // Load User Info
    const user = auth.getUser();
    if (user) {
        document.getElementById('user-display-name').textContent = user.user_display_name || user.user_nicename;
    }

    // Load Data
    await loadDashboardData();
});

/**
 * Determine user type and load appropriate dashboard
 */
async function loadDashboardData() {
    // First, fetch fresh user data from API to get accurate role/client info
    let userData = auth.getUser();

    try {
        const response = await api.get('/auth/me');
        const freshData = response.data?.data || response.data;
        if (freshData) {
            // Merge fresh data with stored data
            userData = { ...userData, ...freshData };
            // Check if user has client record
            userData.client_id = freshData.client?.id || freshData.client_id;
            userData.client = freshData.client;
            userData.counts = freshData.counts;
        }
    } catch (error) {
        console.error('Failed to fetch user data:', error);
    }

    // Determine if user is a Client (has client record) or just a Member
    const isClient = userData.client_id ||
                     userData.client ||
                     (userData.roles && userData.roles.includes('client')) ||
                     userData.role === 'client';

    if (isClient) {
        // CLIENT VIEW - Full portal access
        document.getElementById('client-view').style.display = 'block';
        document.getElementById('member-view').style.display = 'none';

        // Update stats from fresh data if available
        if (userData.counts) {
            updateStatsFromCounts(userData.counts);
        }

        // Load all client data in parallel
        await Promise.all([
            loadProjects(),
            loadUserStats(),
            loadUnreadMessages(),
            loadUpcomingAppointments()
        ]);
    } else {
        // MEMBER VIEW - Limited access (no projects/invoices, but can message, create tickets, book appointments)
        document.getElementById('client-view').style.display = 'none';
        document.getElementById('member-view').style.display = 'block';
        document.getElementById('member-display-name').textContent = userData.user_display_name || userData.user_nicename;

        // Load member-specific data
        await Promise.all([
            loadMemberUnreadMessages(),
            loadMemberAppointments(),
            loadMemberTickets()
        ]);
    }
}

/**
 * Update stats directly from counts object
 */
function updateStatsFromCounts(counts) {
    const projectsEl = document.getElementById('stats-projects-count');
    const invoicesEl = document.getElementById('stats-invoices-due');
    const ticketsEl = document.getElementById('stats-tickets-open');

    if (projectsEl && counts.projects !== undefined) {
        projectsEl.textContent = counts.projects;
    }
    if (invoicesEl && (counts.invoices_unpaid !== undefined || counts.invoices_due !== undefined)) {
        invoicesEl.textContent = counts.invoices_unpaid || counts.invoices_due || 0;
    }
    if (ticketsEl && (counts.tickets_open !== undefined || counts.tickets !== undefined)) {
        ticketsEl.textContent = counts.tickets_open || counts.tickets || 0;
    }
}

// ─────────────────────────────────────────────────────────────
// CLIENT-SPECIFIC LOADERS
// ─────────────────────────────────────────────────────────────

async function loadProjects() {
    try {
        const response = await api.get('/projects/my');
        const projects = response.data?.data || response.data || [];
        renderProjects(projects);
        updateProjectStats(projects);
    } catch (error) {
        console.error('Failed to load projects:', error);
        renderMockProjects();
    }
}

async function loadUserStats() {
    try {
        const response = await api.get('/auth/me');
        const data = response.data?.data || response.data;
        if (data?.counts) {
            const invoicesDue = data.counts.invoices_unpaid || data.counts.invoices_due || 0;
            const ticketsOpen = data.counts.tickets_open || data.counts.tickets || 0;
            document.getElementById('stats-invoices-due').textContent = invoicesDue;
            document.getElementById('stats-tickets-open').textContent = ticketsOpen;
        }
    } catch (error) {
        console.error('Failed to load user stats:', error);
    }
}

async function loadUnreadMessages() {
    const badge = document.getElementById('unread-messages-badge');
    if (!badge) return;

    try {
        const response = await api.get('/messages/unread/count');
        const count = response.data?.data?.count || response.data?.count || 0;
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    } catch (error) {
        console.error('Failed to load unread messages:', error);
        badge.style.display = 'none';
    }
}

async function loadUpcomingAppointments() {
    const container = document.getElementById('appointments-container');
    if (!container) return;

    try {
        const response = await api.get('/appointments/upcoming');
        const appointments = response.data?.data || response.data || [];
        renderAppointments(appointments.slice(0, 3)); // Show max 3
    } catch (error) {
        console.error('Failed to load appointments:', error);
        container.innerHTML = '<p class="empty-text">No upcoming appointments.</p>';
    }
}

function renderAppointments(appointments) {
    const container = document.getElementById('appointments-container');
    if (!container) return;

    if (!appointments || appointments.length === 0) {
        container.innerHTML = '<p class="empty-text">No upcoming appointments.</p>';
        return;
    }

    container.innerHTML = appointments.map(apt => `
        <div class="appointment-item">
            <div class="appointment-date">
                <span class="apt-day">${new Date(apt.appointment_date).getDate()}</span>
                <span class="apt-month">${new Date(apt.appointment_date).toLocaleString('default', { month: 'short' })}</span>
            </div>
            <div class="appointment-info">
                <div class="apt-type">${formatAppointmentType(apt.appointment_type)}</div>
                <div class="apt-time">${apt.start_time || ''}</div>
            </div>
        </div>
    `).join('');
}

function updateProjectStats(projects) {
    if (!projects) return;
    const activeCount = projects.filter(p => p.status !== 'completed' && p.status !== 'archived').length;
    document.getElementById('stats-projects-count').textContent = activeCount;
}

function renderProjects(projects) {
    const container = document.getElementById('projects-container');

    if (!projects || projects.length === 0) {
        container.innerHTML = '<p class="empty-text">No active projects found.</p>';
        return;
    }

    container.innerHTML = projects.map(project => `
        <a href="project-details.html?id=${project.id}" class="project-card">
            <div class="project-info">
                <h3>${project.project_name}</h3>
                <div class="project-meta">Started: ${new Date(project.start_date).toLocaleDateString()}</div>
            </div>
            <div class="project-status status-${(project.status || 'pending').toLowerCase().replace('_', '-')}">
                ${(project.status || 'Pending').replace('_', ' ')}
            </div>
        </a>
    `).join('');
}

function renderMockProjects() {
    const container = document.getElementById('projects-container');

    // Mock Data for demonstration
    const mockProjects = [
        { id: 101, project_name: 'Website Redesign', start_date: '2026-01-05', status: 'in_progress' },
        { id: 102, project_name: 'SEO Audit', start_date: '2026-01-10', status: 'planning' },
        { id: 103, project_name: 'Q4 Marketing Campaign', start_date: '2025-11-01', status: 'completed' }
    ];

    renderProjects(mockProjects);
    updateProjectStats(mockProjects);
}

// ─────────────────────────────────────────────────────────────
// MEMBER-SPECIFIC LOADERS
// ─────────────────────────────────────────────────────────────

async function loadMemberUnreadMessages() {
    const countEl = document.getElementById('member-messages-count');

    try {
        const response = await messageService.getUnreadCount();
        const count = response.data?.count || response.count || 0;
        if (countEl) countEl.textContent = count;
    } catch (error) {
        console.error('Failed to load member messages:', error);
        if (countEl) countEl.textContent = '0';
    }
}

async function loadMemberAppointments() {
    const container = document.getElementById('member-appointments-container');
    if (!container) return;

    try {
        const response = await api.get('/appointments/my');
        const appointments = response.data?.data || response.data || [];
        const upcoming = appointments.filter(a => new Date(a.appointment_date) >= new Date()).slice(0, 2);

        if (upcoming.length === 0) {
            container.innerHTML = '<p class="empty-text">No upcoming appointments.</p>';
            return;
        }

        container.innerHTML = upcoming.map(apt => `
            <div class="appointment-item">
                <div class="appointment-date">
                    <span class="apt-day">${new Date(apt.appointment_date).getDate()}</span>
                    <span class="apt-month">${new Date(apt.appointment_date).toLocaleString('default', { month: 'short' })}</span>
                </div>
                <div class="appointment-info">
                    <div class="apt-type">${formatAppointmentType(apt.appointment_type)}</div>
                    <div class="apt-time">${apt.start_time || ''}</div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Failed to load member appointments:', error);
        container.innerHTML = '<p class="empty-text">No upcoming appointments.</p>';
    }
}

async function loadMemberTickets() {
    const container = document.getElementById('member-tickets-container');
    const countEl = document.getElementById('member-tickets-count');
    if (!container) return;

    try {
        const response = await api.get('/tickets/my');
        const tickets = response.data?.data || response.data || [];
        const openTickets = tickets.filter(t => t.status !== 'closed' && t.status !== 'resolved');

        if (countEl) countEl.textContent = openTickets.length;

        if (openTickets.length === 0) {
            container.innerHTML = '<p class="empty-text">No open tickets.</p>';
            return;
        }

        container.innerHTML = openTickets.slice(0, 3).map(ticket => `
            <a href="ticket-details.html?id=${ticket.id}" class="ticket-card">
                <div class="ticket-info">
                    <h4>${ticket.subject}</h4>
                    <span class="ticket-status status-${(ticket.status || 'open').toLowerCase().replace('_', '-')}">${ticket.status || 'Open'}</span>
                </div>
            </a>
        `).join('');
    } catch (error) {
        console.error('Failed to load member tickets:', error);
        container.innerHTML = '<p class="empty-text">No open tickets.</p>';
        if (countEl) countEl.textContent = '0';
    }
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function formatAppointmentType(type) {
    if (!type) return 'Appointment';
    return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
