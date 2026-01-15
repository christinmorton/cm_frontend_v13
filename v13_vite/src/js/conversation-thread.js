/**
 * conversation-thread.js
 * Single conversation thread view with messaging
 */

import { auth } from './auth.js';
import { messageService } from './services/MessageService.js';

// Guard: Require authentication
auth.requireAuth();

// Reveal app after auth check
document.getElementById('thread-app').style.display = 'block';

// State
let conversationId = null;
let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Setup logout
    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        auth.logout();
    });

    // Get conversation ID from URL
    const params = new URLSearchParams(window.location.search);
    conversationId = params.get('id');

    if (!conversationId) {
        showError('No conversation ID provided.');
        return;
    }

    currentUser = auth.getUser();

    // Setup message form
    document.getElementById('message-form').addEventListener('submit', handleSend);

    // Load conversation
    await loadConversation();
    await loadMessages();
});

async function loadConversation() {
    try {
        const response = await messageService.getConversation(conversationId);
        const conversation = response.data || response;
        document.getElementById('conversation-title').textContent = conversation.subject || conversation.title || 'Conversation';
    } catch (error) {
        console.error('Failed to load conversation:', error);
    }
}

async function loadMessages() {
    const container = document.getElementById('messages-container');
    container.innerHTML = '<div class="loader-container">Loading messages...</div>';

    try {
        const response = await messageService.getMessages(conversationId);
        const messages = response.data || response || [];
        renderMessages(messages);

        // Mark unread messages as read
        messages.forEach(msg => {
            if (!msg.is_read && msg.sender_id !== currentUser?.id) {
                messageService.markAsRead(msg.id).catch(() => {});
            }
        });
    } catch (error) {
        console.error('Failed to load messages:', error);
        container.innerHTML = '<p class="error-message">Failed to load messages.</p>';
    }
}

function renderMessages(messages) {
    const container = document.getElementById('messages-container');

    if (messages.length === 0) {
        container.innerHTML = '<p class="empty-message">No messages yet. Start the conversation!</p>';
        return;
    }

    container.innerHTML = messages.map(msg => {
        const isOwn = msg.sender_id === currentUser?.id || msg.is_own;
        return `
            <div class="message ${isOwn ? 'message-own' : 'message-other'}">
                <div class="message-bubble">
                    <div class="message-sender">${msg.sender_name || (isOwn ? 'You' : 'Support')}</div>
                    <div class="message-content">${escapeHtml(msg.content)}</div>
                    <div class="message-time">${formatTime(msg.created_at)}</div>
                </div>
            </div>
        `;
    }).join('');

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
}

async function handleSend(e) {
    e.preventDefault();

    const input = document.getElementById('message-input');
    const content = input.value.trim();
    const submitBtn = document.getElementById('send-btn');

    if (!content) return;

    submitBtn.disabled = true;
    input.disabled = true;

    try {
        await messageService.sendMessage(conversationId, content);
        input.value = '';
        await loadMessages();
    } catch (error) {
        console.error('Failed to send message:', error);
        alert('Failed to send message. Please try again.');
    } finally {
        submitBtn.disabled = false;
        input.disabled = false;
        input.focus();
    }
}

function formatTime(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showError(message) {
    document.getElementById('conversation-title').textContent = 'Error';
    document.getElementById('messages-container').innerHTML = `<p class="error-message">${message}</p>`;
}
