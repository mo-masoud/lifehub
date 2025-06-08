import axios from 'axios';

declare global {
    interface Window {
        axios: typeof axios;
    }
}

window.axios = axios;

// Configure axios defaults
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.withCredentials = true;
axios.defaults.withXSRFToken = true;

// Global CSRF initialization flag
let csrfInitialized = false;

// Initialize CSRF protection once
const initializeCsrf = async (): Promise<void> => {
    if (csrfInitialized) return;

    try {
        await axios.get('/sanctum/csrf-cookie');
        csrfInitialized = true;
    } catch (error) {
        console.error('Failed to initialize CSRF protection:', error);
        throw error;
    }
};

// Response interceptor to handle CSRF token expiration
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If we get a 419 (CSRF token mismatch) or 401, try to refresh CSRF token
        if ((error.response?.status === 419 || error.response?.status === 401) && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Reset the flag and get a new CSRF token
                csrfInitialized = false;
                await initializeCsrf();

                // Retry the original request
                return axios(originalRequest);
            } catch (csrfError) {
                console.error('Failed to refresh CSRF token:', csrfError);
                return Promise.reject(error);
            }
        }

        return Promise.reject(error);
    },
);

// Request interceptor to ensure CSRF is initialized before API calls
axios.interceptors.request.use(
    async (config) => {
        // Only initialize CSRF for API routes that need it
        if (config.url?.includes('/api/') || config.method !== 'get') {
            await initializeCsrf();
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// Initialize CSRF protection when the app starts
initializeCsrf().catch((error) => {
    console.warn('Initial CSRF initialization failed:', error);
});
