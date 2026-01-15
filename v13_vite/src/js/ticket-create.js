/**
 * ticket-create.js
 * Create new support ticket
 */

import { auth } from './auth.js';
import { ticketService } from './services/TicketService.js';

// Guard: Require authentication
auth.requireAuth();

// Reveal app after auth check
document.getElementById('create-app').style.display = 'block';

document.addEventListener('DOMContentLoaded', () => {
    // Setup logout
    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        auth.logout();
    });

    // Setup form
    document.getElementById('ticket-form').addEventListener('submit', handleSubmit);
});

async function handleSubmit(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    hideMessage();

    const data = {
        subject: document.getElementById('subject').value.trim(),
        description: document.getElementById('description').value.trim(),
        priority: document.getElementById('priority').value,
        category: document.getElementById('category').value
    };

    // Validate
    if (!data.subject) {
        showMessage('Please enter a subject.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Ticket';
        return;
    }

    if (!data.description) {
        showMessage('Please enter a description.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Ticket';
        return;
    }

    try {
        const response = await ticketService.create(data);
        const ticketId = response.data?.id || response.id;

        showMessage('Ticket created successfully! Redirecting...', 'success');

        setTimeout(() => {
            window.location.href = ticketId ? `ticket-details.html?id=${ticketId}` : 'tickets.html';
        }, 1500);
    } catch (error) {
        console.error('Failed to create ticket:', error);
        showMessage(error.response?.data?.message || 'Failed to create ticket. Please try again.', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Ticket';
    }
}

function showMessage(text, type) {
    const el = document.getElementById('form-message');
    el.textContent = text;
    el.className = `form-message ${type}`;
    el.style.display = 'block';
}

function hideMessage() {
    document.getElementById('form-message').style.display = 'none';
}
