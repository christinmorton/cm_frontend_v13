import axios from 'axios';

// Base API configuration
// Get from environment variables, with fallback to local development URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://general-wp.local/wp-json/wpbe/v1';
const JWT_AUTH_URL = import.meta.env.VITE_JWT_AUTH_URL || 'http://general-wp.local/wp-json/jwt-auth/v1';

// ─────────────────────────────────────────────────────────────
// Error Codes & User-Friendly Messages (synced with backend)
// ─────────────────────────────────────────────────────────────
export const ERROR_MESSAGES = {
    // Auth (401)
    rest_not_logged_in: 'Please log in to continue',
    rest_invalid_token: 'Your session has expired',
    rest_guest_expired: 'Your session has expired',
    rest_expired_key: 'This reset link has expired. Please request a new one.',
    rest_invalid_key: 'This reset link is invalid. Please request a new one.',

    // Permission (403)
    rest_forbidden: "You don't have permission to do this",
    rest_not_owner: 'You cannot access this resource',

    // Validation (400)
    rest_invalid_param: 'Please check your input',
    rest_missing_param: 'Required information is missing',
    rest_email_exists: 'This email is already registered. Try logging in instead.',
    rest_username_exists: 'This username is already taken. Please choose another.',
    rest_weak_password: 'Password must be at least 8 characters',
    rest_invalid_email: 'Please enter a valid email address',
    rest_invalid_slot: 'This time slot is no longer available',

    // Not Found (404)
    rest_not_found: 'The requested item was not found',

    // Server (500)
    rest_cannot_create: 'Unable to create. Please try again.',
    rest_cannot_update: 'Unable to save changes. Please try again.',
    rest_cannot_delete: 'Unable to delete. Please try again.',
    rest_error: 'Something went wrong. Please try again.',

    // Network
    network_error: 'Connection failed. Please check your internet.'
};

/**
 * Get user-friendly error message from API error response
 * @param {Object} error - Axios error or API error response
 * @returns {string} User-friendly error message
 */
export function getErrorMessage(error) {
    // Handle axios error with response
    if (error.response?.data) {
        const data = error.response.data;
        const code = data.code;
        if (code && ERROR_MESSAGES[code]) {
            return ERROR_MESSAGES[code];
        }
        return data.message || ERROR_MESSAGES.rest_error;
    }

    // Handle direct API error object
    if (error.code && ERROR_MESSAGES[error.code]) {
        return ERROR_MESSAGES[error.code];
    }

    // Handle network errors
    if (error.message === 'Network Error' || !navigator.onLine) {
        return ERROR_MESSAGES.network_error;
    }

    // Fallback to error message or default
    return error.message || ERROR_MESSAGES.rest_error;
}

/**
 * Get error code from API error response
 * @param {Object} error - Axios error or API error response
 * @returns {string|null} Error code or null
 */
export function getErrorCode(error) {
    if (error.response?.data?.code) {
        return error.response.data.code;
    }
    return error.code || null;
}

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Request interceptor: Attach JWT token if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwt_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor: Handle 401 (Unauthorized)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('user_data');

            // Only redirect if we are not already on the login page
            if (!window.location.pathname.includes('login.html')) {
                window.location.href = '/login.html';
            }
        }
        return Promise.reject(error);
    }
);

export { API_BASE_URL, JWT_AUTH_URL };
export default api;
