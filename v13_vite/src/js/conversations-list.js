/**
 * conversations-list.js
 * Conversations listing
 */

import { auth } from './auth.js';
import { messageService } from './services/MessageService.js';

// Guard: Require authentication
auth.requireAuth();

// Reveal app after auth check
document.getElementById('conversations-app').style.display = 'block';

document.addEventListener('DOMContentLoaded', async () => {
    // Setup logout
    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        auth.logout();
    });

    await loadConversations();
});

async function loadConversations() {
    const container = document.getElementById('conversations-container');
    container.innerHTML = '<div class="loader-container">Loading conversations...</div>';

    try {
        const response = await messageService.getMyConversations();
        const conversations = response.data || response || [];
        renderConversations(conversations);
    } catch (error) {
        console.error('Failed to load conversations:', error);
        container.innerHTML = '<p class="error-message">Failed to load conversations. Please try again.</p>';
    }
}

function renderConversations(conversations) {
    const container = document.getElementById('conversations-container');

    if (conversations.length === 0) {
        container.innerHTML = '<p class="empty-message">No conversations yet.</p>';
        return;
    }

    container.innerHTML = conversations.map(conv => `
        <a href="conversation-thread.html?id=${conv.id}" class="conversation-card ${conv.unread_count > 0 ? 'has-unread' : ''}">
            <div class="conversation-info">
                <div class="conversation-header">
                    <h3>${conv.subject || conv.title || 'Conversation'}</h3>
                    ${conv.unread_count > 0 ? `<span class="unread-badge">${conv.unread_count}</span>` : ''}
                </div>
                <p class="conversation-preview">${conv.last_message || conv.preview || 'No messages yet'}</p>
                <div class="conversation-meta">
                    ${conv.entity_type ? `${conv.entity_type} • ` : ''}
                    ${conv.updated_at ? formatDate(conv.updated_at) : ''}
                </div>
            </div>
            <i class="icofont-arrow-right"></i>
        </a>
    `).join('');
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}
