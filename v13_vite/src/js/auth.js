import axios from 'axios';
import { JWT_AUTH_URL, API_BASE_URL } from './api.js';
import api from './api.js';

export const auth = {
    /**
     * Login user with username and password
     * @param {string} username 
     * @param {string} password 
     * @returns {Promise<object>} User data
     */
    async login(username, password) {
        try {
            // 1. Get Token
            const tokenResponse = await axios.post(`${JWT_AUTH_URL}/token`, {
                username,
                password
            });

            const { token, user_email, user_display_name } = tokenResponse.data;

            if (!token) throw new Error('No token received');

            // 2. Store Token
            localStorage.setItem('jwt_token', token);

            // 3. Fetch full user profile to confirm validity and get ID
            // Using the 'api' instance here ensures the new token is used
            const meResponse = await api.get('/auth/me');
            const userData = meResponse.data;

            // 4. Store user data
            localStorage.setItem('user_data', JSON.stringify(userData));

            return userData;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    },

    /**
     * Logout user and clear session
     */
    logout() {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_data');
        window.location.href = '/login.html';
    },

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        return !!localStorage.getItem('jwt_token');
    },

    /**
     * Get current stored user data
     * @returns {object|null}
     */
    getUser() {
        const data = localStorage.getItem('user_data');
        return data ? JSON.parse(data) : null;
    },

    /**
     * Guard: Redirect to login if not authenticated
     */
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/login.html';
        }
    }
};
