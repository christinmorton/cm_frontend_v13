import { auth } from './auth.js';
import api from './api.js';

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

async function loadDashboardData() {
    const user = auth.getUser();
    // Logic: If user has 'client_id' or role is 'client' -> Client Dashboard
    // Else -> Member Dashboard (Orders, etc.)
    const isClient = user.role === 'client' || user.client_id;

    if (isClient) {
        document.getElementById('client-view').style.display = 'block';
        document.getElementById('member-view').style.display = 'none';

        // Load all data in parallel
        await Promise.all([
            loadProjects(),
            loadUserStats(),
            loadUnreadMessages(),
            loadUpcomingAppointments()
        ]);
    } else {
        // MEMBERS / CUSTOMERS VIEW
        document.getElementById('client-view').style.display = 'none';
        document.getElementById('member-view').style.display = 'block';
        document.getElementById('member-display-name').textContent = user.user_display_name || user.user_nicename;
    }
}

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
                <div class="apt-type">${apt.appointment_type || 'Appointment'}</div>
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
        container.innerHTML = '<p>No active projects found.</p>';
        return;
    }

    container.innerHTML = projects.map(project => `
        <a href="project-details.html?id=${project.id}" class="project-card">
            <div class="project-info">
                <h3>${project.project_name}</h3>
                <div class="project-meta">Started: ${new Date(project.start_date).toLocaleDateString()}</div>
            </div>
            <div class="project-status status-${project.status.toLowerCase().replace('_', '-')}">
                ${project.status.replace('_', ' ')}
            </div>
        </a>
    `).join('');
}

function updateStats(projects) {
    if (!projects) return;

    // Simple stats calculation
    const activeCount = projects.filter(p => p.status !== 'completed' && p.status !== 'archived').length;
    document.getElementById('stats-projects-count').textContent = activeCount;

    // Placeholder for other stats until endpoints exist
    document.getElementById('stats-invoices-due').textContent = '0';
    document.getElementById('stats-tickets-open').textContent = '0';
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
    updateStats(mockProjects);
}
