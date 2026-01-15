/**
 * ticket-details.js
 * Single ticket view
 */

import { auth } from './auth.js';
import { ticketService } from './services/TicketService.js';

// Guard: Require authentication
auth.requireAuth();

// Reveal app after auth check
document.getElementById('ticket-app').style.display = 'block';

document.addEventListener('DOMContentLoaded', async () => {
    // Setup logout
    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        auth.logout();
    });

    // Get ticket ID from URL
    const params = new URLSearchParams(window.location.search);
    const ticketId = params.get('id');

    if (!ticketId) {
        showError('No ticket ID provided.');
        return;
    }

    await loadTicket(ticketId);
});

async function loadTicket(id) {
    try {
        const response = await ticketService.getTicket(id);
        const ticket = response.data || response;
        renderTicket(ticket);
    } catch (error) {
        console.error('Failed to load ticket:', error);
        showError('Failed to load ticket. It may not exist or you may not have access.');
    }
}

function renderTicket(ticket) {
    document.getElementById('ticket-subject').textContent = ticket.subject || 'No subject';
    document.getElementById('ticket-id').textContent = `#${ticket.id}`;
    document.getElementById('ticket-status').textContent = (ticket.status || 'open').replace('_', ' ');
    document.getElementById('ticket-status').className = `ticket-status status-${(ticket.status || 'open').toLowerCase().replace('_', '-')}`;

    document.getElementById('ticket-description').textContent = ticket.description || 'No description provided.';

    // Sidebar info
    document.getElementById('info-priority').textContent = ticket.priority || 'Medium';
    document.getElementById('info-category').textContent = ticket.category || 'General';
    document.getElementById('info-created').textContent = ticket.created_at ? new Date(ticket.created_at).toLocaleDateString() : '-';
    document.getElementById('info-updated').textContent = ticket.updated_at ? new Date(ticket.updated_at).toLocaleDateString() : '-';
}

function showError(message) {
    document.getElementById('ticket-subject').textContent = 'Error';
    document.getElementById('ticket-description').textContent = message;
}
