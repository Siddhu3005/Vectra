import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vectra_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      localStorage.removeItem('vectra_token');
      localStorage.removeItem('vectra_user');
      if (window.location.pathname !== '/login') {
        window.location.assign('/login?expired=true');
      }
    }
    return Promise.reject(error);
  },
);



export const errorMessage = (error) =>
  error.response?.data?.message || error.response?.data?.error || error.message || 'Something went wrong';
export default api;
