/**
 * tickets-list.js
 * Support tickets listing with filtering
 */

import { auth } from './auth.js';
import { ticketService } from './services/TicketService.js';

// Guard: Require authentication
auth.requireAuth();

// Reveal app after auth check
document.getElementById('tickets-app').style.display = 'block';

// State
let allTickets = [];
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
            renderTickets();
        });
    });

    // Load tickets
    await loadTickets();
});

async function loadTickets() {
    const container = document.getElementById('tickets-container');
    container.innerHTML = '<div class="loader-container">Loading tickets...</div>';

    try {
        const response = await ticketService.getMyTickets();
        allTickets = response.data || response || [];
        renderTickets();
    } catch (error) {
        console.error('Failed to load tickets:', error);
        container.innerHTML = '<p class="error-message">Failed to load tickets. Please try again.</p>';
    }
}

function renderTickets() {
    const container = document.getElementById('tickets-container');

    // Filter tickets
    let filtered = allTickets;
    if (currentFilter !== 'all') {
        filtered = allTickets.filter(t => t.status === currentFilter);
    }

    // Update count
    document.getElementById('ticket-count').textContent = `${filtered.length} ticket${filtered.length !== 1 ? 's' : ''}`;

    if (filtered.length === 0) {
        container.innerHTML = '<p class="empty-message">No tickets found.</p>';
        return;
    }

    container.innerHTML = filtered.map(ticket => `
        <a href="ticket-details.html?id=${ticket.id}" class="ticket-card">
            <div class="ticket-info">
                <div class="ticket-header">
                    <span class="ticket-id">#${ticket.id}</span>
                    <span class="ticket-priority priority-${(ticket.priority || 'medium').toLowerCase()}">${ticket.priority || 'medium'}</span>
                </div>
                <h3>${ticket.subject || 'No subject'}</h3>
                <div class="ticket-meta">
                    ${ticket.category ? `${ticket.category} • ` : ''}
                    ${ticket.created_at ? `Created ${formatDate(ticket.created_at)}` : ''}
                </div>
            </div>
            <div class="ticket-status status-${(ticket.status || 'open').toLowerCase().replace('_', '-')}">
                ${(ticket.status || 'open').replace('_', ' ')}
            </div>
        </a>
    `).join('');
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
}
