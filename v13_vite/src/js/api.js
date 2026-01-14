import axios from 'axios';

// Base API configuration
// NOTE: In production, this should come from import.meta.env.VITE_API_URL
// For now, defaulting to local WP instance per guide
const API_BASE_URL = 'http://general-wp.local/wp-json/wpbe/v1';
const JWT_AUTH_URL = 'http://general-wp.local/wp-json/jwt-auth/v1';

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
