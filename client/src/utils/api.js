import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_SERVER_URL,
  withCredentials: true, // Crucial: send the HttpOnly cookie
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Catch expired tokens and refresh them
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and code is TOKEN_EXPIRED, and we haven't retried yet
    if (error.response?.status === 401 && error.response.data.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Call the refresh endpoint (HttpOnly cookie is sent automatically)
        const res = await axios.post(`${process.env.REACT_APP_SERVER_URL}/api/business/refresh`, {}, { withCredentials: true });
        const { accessToken } = res.data;

        // Save new token and retry the original request
        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, log out the user
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;