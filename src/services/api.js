const BASE_URL = 'https://r885rw6c-8000.inc1.devtunnels.ms';

const api = {
    onUnauthorized: null,

    async request(endpoint, options = {}) {
        const token = localStorage.getItem('mf_access');
        const headers = {
            ...options.headers,
        };

        // Only set application/json if not multipart, and if there is a body or it's a POST/PUT
        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers,
        };

        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, config);

            if (response.status === 401) {
                if (this.onUnauthorized) {
                    this.onUnauthorized();
                }
                throw new Error('Session expired. Please login again.');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.detail || 'Something went wrong');
            }

            return data;
        } catch (error) {
            throw error;
        }
    },

    get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    },

    post(endpoint, body, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(body),
        });
    },

    put(endpoint, body, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(body),
        });
    },

    delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    },

    // Auth
    login(username, password) {
        return this.post('/api/auth/login/', { username, password });
    },

    register(data) {
        return this.post('/api/auth/create/', data);
    },

    getProfile() {
        return this.get('/api/auth/profile/');
    },

    // Meetings CRUD
    getMeetings() {
        return this.get('/api/meet/');
    },

    getMeeting(uid) {
        return this.get(`/api/meet/${uid}/`);
    },

    createMeeting(data) {
        return this.post('/api/meet/', data);
    },

    updateMeeting(uid, data) {
        return this.put(`/api/meet/${uid}/`, data);
    },

    deleteMeeting(uid) {
        return this.delete(`/api/meet/${uid}/`);
    },

    // Meeting Actions & Lifecycle
    markInProgress(uid) {
        return this.post(`/api/meet/${uid}/mark-in-progress/`, {});
    },

    markCompleted(uid, otp) {
        return this.post(`/api/meet/${uid}/mark-completed/`, { otp_code: otp });
    },

    markCancelled(uid) {
        return this.post(`/api/meet/${uid}/mark-cancelled/`, {});
    },

    generateOTP(uid) {
        return this.post(`/api/meet/${uid}/generate-otp/`, {});
    },

    verifyOTP(uid, otp) {
        return this.post(`/api/meet/${uid}/verify-otp/`, { otp_code: otp });
    },

    uploadPhoto(uid, file) {
        const formData = new FormData();
        formData.append('file', file);
        return this.request(`/api/meet/${uid}/upload-photo/`, {
            method: 'POST',
            body: formData,
            headers: {
                // Fetch will set Content-Type correctly with boundary if we omit it
            }
        });
    },

    // Kept for backward compatibility/utility
    resendOTP(uid) {
        return this.post(`/api/meet/${uid}/resend-otp/`, {});
    },
};

export default api;
