import { auth } from './auth.js';
import api from './api.js';
import { testMode } from './utils/testMode.js';

// 1. Guard (skip in test mode)
if (!testMode.isEnabled()) {
    auth.requireAuth();
}

// 2. Reveal
document.getElementById('project-app').style.display = 'block';

document.addEventListener('DOMContentLoaded', async () => {

    // Logout Handler
    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        auth.logout();
    });

    // Get ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');

    if (!projectId) {
        alert('No project ID specified');
        window.location.href = 'dashboard.html';
        return;
    }

    await loadProjectDetails(projectId);
});

async function loadProjectDetails(id) {
    // Test mode: use mock data
    if (testMode.isEnabled()) {
        console.log('[TestMode] Loading test project details for ID:', id);
        const mockProject = getMockProject(id);
        if (mockProject) {
            renderProject(mockProject);
        } else {
            // Create a generic mock for any ID in test mode
            renderProject({
                id: parseInt(id),
                project_name: `Test Project #${id}`,
                description: 'This is a test project created for demonstration purposes.',
                status: 'in_progress',
                start_date: '2026-01-05',
                deadline: '2026-03-01',
                budget: 5000,
                deliverables: ['Deliverable 1', 'Deliverable 2', 'Deliverable 3']
            });
        }
        return;
    }

    try {
        const response = await api.get(`/projects/${id}`);
        renderProject(response.data);
    } catch (error) {
        console.error('Error fetching project:', error);

        // Fallback Mock Data
        const mockProject = getMockProject(id);
        if (mockProject) {
            renderProject(mockProject);
        } else {
            document.getElementById('project-name').textContent = 'Project Not Found';
            document.getElementById('project-description').textContent = 'The requested project could not be loaded.';
        }
    }
}

function renderProject(project) {
    document.title = `${project.project_name} | Client Portal`;

    document.getElementById('project-name').textContent = project.project_name;
    document.getElementById('project-id').textContent = `ID: #${project.id}`;
    document.getElementById('project-status').textContent = `Status: ${project.status.replace('_', ' ')}`;
    document.getElementById('project-description').textContent = project.description || 'No description available.';

    document.getElementById('start-date').textContent = project.start_date ? new Date(project.start_date).toLocaleDateString() : 'TBD';
    document.getElementById('deadline').textContent = project.deadline ? new Date(project.deadline).toLocaleDateString() : 'TBD';

    // Format currency
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });
    document.getElementById('budget').textContent = project.budget ? formatter.format(project.budget) : '---';

    // Deliverables
    const deliverablesList = document.getElementById('deliverables-list');
    if (project.deliverables && project.deliverables.length > 0) {
        deliverablesList.innerHTML = project.deliverables.map(d => `<li>${d}</li>`).join('');
    } else {
        deliverablesList.innerHTML = '<li>No specific deliverables listed.</li>';
    }
}

// Mock Data Helper
function getMockProject(id) {
    const mocks = {
        '101': {
            id: 101,
            project_name: 'Website Redesign',
            description: 'Complete overhaul of the corporate website using the new branding guidelines. Includes migration to headless architecture.',
            status: 'in_progress',
            start_date: '2026-01-05',
            deadline: '2026-03-01',
            budget: 12000,
            deliverables: ['Homepage Design', 'About Page', 'Service Pages', 'Contact Form Integration']
        },
        '102': {
            id: 102,
            project_name: 'SEO Audit',
            description: 'Comprehensive analysis of current site performance and search rankings.',
            status: 'planning',
            start_date: '2026-01-10',
            deadline: '2026-01-20',
            budget: 2500,
            deliverables: ['Technical Audit Report', 'Keyword Strategy', 'Competitor Analysis']
        }
    };
    return mocks[id] || null;
}
