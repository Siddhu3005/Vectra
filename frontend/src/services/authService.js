import api from './api';
export const login = (credentials) => api.post('/auth/login', credentials).then((r) => r.data);
export const register = (payload) => api.post('/auth/register', payload).then((r) => r.data);
