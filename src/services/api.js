const BASE_URL = "https://r885rw6c-8000.inc1.devtunnels.ms";

const api = {
  onUnauthorized: null,

    async request(endpoint, options = {}) {
        const token = localStorage.getItem('mf_access');
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
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
        throw new Error("Session expired. Please login again.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.detail || "Something went wrong");
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "GET" });
  },

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  },

    markInProgress(uid) {
        return this.post(`/api/meet/${uid}/mark-in-progress/`, {});
    },

    markCompleted(uid, otp) {
        return this.post(`/api/meet/${uid}/mark-completed/`, { otp_code: otp });
    },

    resendOTP(uid) {
        return this.post(`/api/meet/${uid}/resend-otp/`, {});
    },

    markCancelled(uid) {
        return this.post(`/api/meet/${uid}/mark-cancelled/`, {});
    },
};

export default api;
