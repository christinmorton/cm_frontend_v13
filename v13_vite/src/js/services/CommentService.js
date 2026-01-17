/**
 * CommentService.js
 * Service for interacting with WordPress REST API comments
 *
 * WordPress Comments API: /wp-json/wp/v2/comments
 *
 * Note: This uses the standard WP REST API, not the WPBE custom API.
 * Comments are tied to WordPress posts by post ID.
 */

import axios from 'axios';

// WordPress REST API base URL (standard WP endpoint, not WPBE)
const WP_API_BASE = import.meta.env.VITE_WP_API_BASE_URL || 'http://general-wp.local/wp-json/wp/v2';

const wpApi = axios.create({
    baseURL: WP_API_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Attach JWT token for authenticated requests
wpApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

class CommentService {
    /**
     * Get comments for a specific post
     * @param {number} postId - WordPress post ID
     * @param {Object} options - Query options
     * @param {number} options.page - Page number (default: 1)
     * @param {number} options.perPage - Comments per page (default: 10)
     * @param {string} options.order - Order direction 'asc' or 'desc' (default: 'desc')
     * @param {string} options.orderby - Order by field (default: 'date')
     * @param {number} options.parent - Parent comment ID for threaded comments (0 for top-level)
     * @returns {Promise<{comments: Array, total: number, totalPages: number}>}
     */
    async getComments(postId, options = {}) {
        const {
            page = 1,
            perPage = 10,
            order = 'desc',
            orderby = 'date',
            parent = null
        } = options;

        const params = {
            post: postId,
            page,
            per_page: perPage,
            order,
            orderby,
            status: 'approve' // Only show approved comments
        };

        if (parent !== null) {
            params.parent = parent;
        }

        const response = await wpApi.get('/comments', { params });

        return {
            comments: response.data,
            total: parseInt(response.headers['x-wp-total'] || '0', 10),
            totalPages: parseInt(response.headers['x-wp-totalpages'] || '0', 10)
        };
    }

    /**
     * Get a single comment by ID
     * @param {number} commentId - Comment ID
     * @returns {Promise<Object>}
     */
    async getComment(commentId) {
        const response = await wpApi.get(`/comments/${commentId}`);
        return response.data;
    }

    /**
     * Submit a new comment
     * Requires authentication OR author details (name, email)
     * @param {Object} commentData
     * @param {number} commentData.post - Post ID (required)
     * @param {string} commentData.content - Comment content (required)
     * @param {number} commentData.parent - Parent comment ID for replies (optional, default: 0)
     * @param {string} commentData.author_name - Author name (required if not logged in)
     * @param {string} commentData.author_email - Author email (required if not logged in)
     * @param {string} commentData.author_url - Author website (optional)
     * @returns {Promise<Object>}
     */
    async submitComment(commentData) {
        const payload = {
            post: commentData.post,
            content: commentData.content,
            parent: commentData.parent || 0
        };

        // Add author info if provided (for guest comments)
        if (commentData.author_name) {
            payload.author_name = commentData.author_name;
        }
        if (commentData.author_email) {
            payload.author_email = commentData.author_email;
        }
        if (commentData.author_url) {
            payload.author_url = commentData.author_url;
        }

        const response = await wpApi.post('/comments', payload);
        return response.data;
    }

    /**
     * Update an existing comment (requires authentication and ownership/admin)
     * @param {number} commentId - Comment ID
     * @param {Object} updateData
     * @param {string} updateData.content - Updated comment content
     * @returns {Promise<Object>}
     */
    async updateComment(commentId, updateData) {
        const response = await wpApi.put(`/comments/${commentId}`, updateData);
        return response.data;
    }

    /**
     * Delete a comment (requires authentication and ownership/admin)
     * @param {number} commentId - Comment ID
     * @param {boolean} force - If true, permanently delete. If false, trash.
     * @returns {Promise<Object>}
     */
    async deleteComment(commentId, force = false) {
        const response = await wpApi.delete(`/comments/${commentId}`, {
            params: { force }
        });
        return response.data;
    }

    /**
     * Get comments by the current user
     * Requires authentication
     * @param {Object} options - Query options
     * @param {number} options.page - Page number
     * @param {number} options.perPage - Comments per page
     * @returns {Promise<{comments: Array, total: number, totalPages: number}>}
     */
    async getMyComments(options = {}) {
        const { page = 1, perPage = 10 } = options;

        // Get current user ID from stored user data
        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
        const userId = userData.user_id || userData.id;

        if (!userId) {
            throw new Error('User not authenticated');
        }

        const response = await wpApi.get('/comments', {
            params: {
                author: userId,
                page,
                per_page: perPage,
                order: 'desc',
                orderby: 'date'
            }
        });

        return {
            comments: response.data,
            total: parseInt(response.headers['x-wp-total'] || '0', 10),
            totalPages: parseInt(response.headers['x-wp-totalpages'] || '0', 10)
        };
    }

    /**
     * Get reply count for a specific comment
     * @param {number} commentId - Parent comment ID
     * @returns {Promise<number>}
     */
    async getReplyCount(commentId) {
        const response = await wpApi.get('/comments', {
            params: {
                parent: commentId,
                per_page: 1 // We only need the total count
            }
        });
        return parseInt(response.headers['x-wp-total'] || '0', 10);
    }
}

export const commentService = new CommentService();
export default commentService;
