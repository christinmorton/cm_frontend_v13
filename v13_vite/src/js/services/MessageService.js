/**
 * MessageService.js
 * Conversations and messages management
 */

import api from '../api.js';

export const messageService = {
    // ─────────────────────────────────────────────────────────────
    // Conversations
    // ─────────────────────────────────────────────────────────────
    async getMyConversations() {
        const response = await api.get('/conversations/my');
        return response.data;
    },

    async getConversation(id) {
        const response = await api.get(`/conversations/${id}`);
        return response.data;
    },

    async getProjectConversation(projectId) {
        const response = await api.get(`/conversations/entity/project/${projectId}`);
        return response.data;
    },

    // ─────────────────────────────────────────────────────────────
    // Messages
    // ─────────────────────────────────────────────────────────────
    async getMessages(conversationId) {
        const response = await api.get(`/messages/conversation/${conversationId}`);
        return response.data;
    },

    async sendMessage(conversationId, content) {
        const response = await api.post('/messages', {
            conversation_id: conversationId,
            content
        });
        return response.data;
    },

    async markAsRead(messageId) {
        const response = await api.put(`/messages/${messageId}/read`);
        return response.data;
    },

    async getUnreadCount() {
        const response = await api.get('/messages/unread/count');
        return response.data;
    }
};
