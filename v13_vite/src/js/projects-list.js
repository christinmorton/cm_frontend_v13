/**
 * projects-list.js
 * Standalone projects listing with status filtering
 */

import { auth } from './auth.js';
import api from './api.js';

// Guard: Require authentication
auth.requireAuth();

// Reveal app after auth check
document.getElementById('projects-app').style.display = 'block';

// State
let allProjects = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', async () => {
    // Setup logout
    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        auth.logout();
    });

    // Setup filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.status;
            renderProjects();
        });
    });

    // Load projects
    await loadProjects();
});

async function loadProjects() {
    const container = document.getElementById('projects-container');
    container.innerHTML = '<div class="loader-container">Loading projects...</div>';

    try {
        const response = await api.get('/projects/my');
        allProjects = response.data?.data || response.data || [];
        renderProjects();
    } catch (error) {
        console.error('Failed to load projects:', error);
        container.innerHTML = '<p class="error-message">Failed to load projects. Please try again.</p>';
    }
}

function renderProjects() {
    const container = document.getElementById('projects-container');

    // Filter projects
    let filtered = allProjects;
    if (currentFilter !== 'all') {
        filtered = allProjects.filter(p => p.status === currentFilter);
    }

    // Update count
    document.getElementById('project-count').textContent = `${filtered.length} project${filtered.length !== 1 ? 's' : ''}`;

    if (filtered.length === 0) {
        container.innerHTML = '<p class="empty-message">No projects found.</p>';
        return;
    }

    container.innerHTML = filtered.map(project => `
        <a href="project-details.html?id=${project.id}" class="project-card">
            <div class="project-info">
                <h3>${project.project_name || project.name || 'Untitled Project'}</h3>
                <div class="project-meta">
                    ${project.start_date ? `Started: ${new Date(project.start_date).toLocaleDateString()}` : ''}
                    ${project.deadline ? ` • Due: ${new Date(project.deadline).toLocaleDateString()}` : ''}
                </div>
            </div>
            <div class="project-status status-${(project.status || 'pending').toLowerCase().replace('_', '-')}">
                ${(project.status || 'pending').replace('_', ' ')}
            </div>
        </a>
    `).join('');
}
