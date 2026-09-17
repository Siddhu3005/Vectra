import api from './api';
export const getUsers = () => api.get('/users').then((r) => r.data);
export const getUser = (id) => api.get(`/users/${id}`).then((r) => r.data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data).then((r) => r.data);
export const deactivateUser = (id) => api.delete(`/users/${id}`);
