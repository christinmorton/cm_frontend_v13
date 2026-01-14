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

        try {
            // NOTE: Using mocked endpoint /projects/my for now based on guide
            const projectsResponse = await api.get('/projects/my');
            const projects = projectsResponse.data;
            renderProjects(projects);
            updateStats(projects);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            renderMockProjects();
        }
    } else {
        // MEMBERS / CUSTOMERS VIEW
        document.getElementById('client-view').style.display = 'none';
        document.getElementById('member-view').style.display = 'block';
        document.getElementById('member-display-name').textContent = user.user_display_name || user.user_nicename;
    }
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
