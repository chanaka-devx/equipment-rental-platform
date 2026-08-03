import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      if (typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken || isRefreshing) {
          return Promise.reject(error);
        }

        try {
          isRefreshing = true;
          const { data } = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
          const newToken = data.access_token || data.accessToken;
          if (newToken) {
            localStorage.setItem('accessToken', newToken);
            if (data.refresh_token || data.refreshToken) {
              localStorage.setItem('refreshToken', data.refresh_token || data.refreshToken);
            }
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        } catch (err) {
          console.error('Session refresh failed', err);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        } finally {
          isRefreshing = false;
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;